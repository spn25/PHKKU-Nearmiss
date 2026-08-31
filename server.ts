import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Safety & Environment Consultant endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history = [], context = {} } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const ai = getGeminiClient();

      if (!ai) {
        // Fallback local expert response if no key is configured
        return res.json({
          reply: `[ระบบให้คำปรึกษาความปลอดภัยอัตโนมัติ]\n\nคำแนะนำเบื้องต้นสำหรับ: "${message}"\n\n1. **ประเมินความปลอดภัยทันที**: หากเป็นเหตุฉุกเฉินหรือมีผู้บาดเจ็บ ให้โทรสายด่วน มข. 043-363000 หรือ 1669\n2. **การป้องกันเบื้องต้น**: กั้นพื้นที่เตือนคนรอบข้าง และสวมใส่อุปกรณ์ PPE ที่เหมาะสม\n3. **การบันทึกรายงาน**: สามารถกดปุ่ม "แจ้งอันตราย / Near Miss" ในหน้านี้เพื่อส่งข้อมูลให้กองอาคารสถานที่เข้าแก้ไขทันที`,
          isFallback: true,
        });
      }

      const systemInstruction = `
คุณคือ "AI Safety & Environment Advisor" ประจำระบบ KKU Nearmiss Safety ของมหาวิทยาลัยขอนแก่น (มข.)
บทบาทของคุณคือให้คำแนะนำที่ถูกต้อง แม่นยำ รวดเร็ว และปฏิบัติได้จริง ด้าน:
1. ความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน (OSHE / OSHA)
2. การประเมินและจำแนกเหตุการณ์: Near Miss (เกือบเกิดอุบัติเหตุ), Unsafe Act (พฤติกรรมเสี่ยง), Unsafe Condition (สภาพแวดล้อมเสี่ยง)
3. การจัดการสารเคมีหก, ไฟฟ้าลัดวงจร, งานบนที่สูง, งานเชื่อม, งานก่อสร้าง, งานห้องแล็บวิจัย
4. อุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคล (PPE)
5. สุขภาพ: โรคลมแดด (Heat Stress), กฎพักสายตา 20-20-20, PM2.5, การดื่มน้ำ
6. การปฐมพยาบาลเบื้องต้น (First Aid)
7. ปัญหาสิ่งแวดล้อม: ขยะอันตราย, น้ำเสีย, คราบน้ำมัน, ฝุ่นควัน

สไตล์การตอบ:
- ตอบด้วยภาษาไทยที่สุภาพ กระชับ อ่านเข้าใจง่าย เป็นข้อๆ ชัดเจน
- หากผู้ใช้ถามภาษาอังกฤษ ให้ตอบเป็นภาษาอังกฤษ
- หากเป็นเรื่องอันตรายเร่งด่วน ให้เตือนความปลอดภัยทันที และแนะนำเบอร์ฉุกเฉิน มข. (เช่น ศูนย์กู้ชีพศรีนครินทร์ 043-363000, รปภ. มข. 043-202222)
- แนะนำขั้นตอนที่ผู้ใช้สามารถนำไปปฏิบัติได้ทันที
- หลีกเลี่ยงข้อความยาวเยิ่นเย้อ เน้น Actionable steps
      `.trim();

      // Format previous chat history for multi-turn context
      const formattedContents: any[] = [];

      if (Array.isArray(history) && history.length > 0) {
        for (const h of history) {
          if (h.role && h.text) {
            formattedContents.push({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }],
            });
          }
        }
      }

      // Add current message
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || 'ขออภัย ไม่สามารถประมวลผลคำตอบได้ในขณะนี้';
      return res.json({ reply, isFallback: false });
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      return res.status(500).json({
        error: 'Failed to generate AI consultation response',
        details: err?.message || 'Unknown error',
      });
    }
  });

  // AI Hazard Vision Analysis endpoint
  app.post('/api/ai/analyze-hazard', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', prompt } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'Image base64 data is required' });
      }

      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          riskLevel: 'medium',
          title: 'ตรวจพบความเสี่ยงสภาพแวดล้อม (Simulation)',
          description: 'พบสภาพการณ์ที่อาจก่อให้เกิดอุบัติเหตุ ควรระมัดระวังและแจ้งผู้ดูแลพื้นที่',
          recommendations: ['สวมใส่อุปกรณ์ PPE', 'กั้นป้ายเตือน', 'ประสานงานช่างซ่อมบำรุง'],
          isFallback: true,
        });
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const imagePart = {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      };

      const textPart = {
        text: prompt || `
วิเคราะห์ภาพถ่ายนี้ตามหลักความปลอดภัยและอาชีวอนามัย (OSHE):
1. ตรวจหาอันตรายหรือพฤติกรรม/สภาพการณ์ที่ไม่ปลอดภัย (Near Miss / Unsafe Condition / Unsafe Act)
2. ตรวจสอบการสวมใส่อุปกรณ์ PPE
3. ประเมินระดับความเสี่ยง (low, medium, high)
4. ให้คำแนะนำแก้ไขอย่างเป็นรูปธรรม

กรุณาตอบเป็น JSON รูปแบบนี้เท่านั้น:
{
  "riskLevel": "low" | "medium" | "high",
  "category": "string",
  "title": "ชื่อสรุปสั้นๆ",
  "description": "คำอธิบายสิ่งที่พบในภาพ",
  "detectedHazards": ["อันตรายที่ 1", "อันตรายที่ 2"],
  "missingPPE": ["PPE ที่ควรสวมใส่"],
  "recommendations": ["ข้อแนะนำที่ 1", "ข้อแนะนำที่ 2"]
}
        `.trim(),
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: 'application/json',
        },
      });

      let parsedResult;
      try {
        parsedResult = JSON.parse(response.text || '{}');
      } catch {
        parsedResult = {
          riskLevel: 'medium',
          title: 'ผลวิเคราะห์ความปลอดภัย AI',
          description: response.text,
          recommendations: ['ตรวจสอบพื้นที่หน้างานอย่างละเอียด'],
        };
      }

      return res.json(parsedResult);
    } catch (err: any) {
      console.error('Hazard vision error:', err);
      return res.status(500).json({
        error: 'Failed to analyze hazard image',
        details: err?.message,
      });
    }
  });

  // Vite middleware in development, static serve in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KKU Nearmiss Safety server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
