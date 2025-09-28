import express, { Request, Response, NextFunction } from 'express'
import { createCableService } from '../src/services/cableService';
import { createBoxService } from '../src/services/boxService';
import { createProspectService } from '../src/services/prospectService';

const app = express();
app.use(express.json());

app.get('/api/v2/health', (_req: Request, res: Response) => res.json({ ok: true }))


app.post('/api/v2/cables', async (req: Request, res: Response) => {  
    const result = await createCableService(req.body);
    return res.status(201).json(result);
});

app.post('/api/v2/boxes', async (req: Request, res: Response) => {  
    const result = await createBoxService(req.body);
    return res.status(201).json(result);
});

app.post('/api/v2/prospects', async (req: Request, res: Response) => {  
    const result = await createProspectService(req.body);
    return res.status(201).json(result);
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: err?.message ?? 'Erro interno' })
})

app.listen(9994, () => {
  console.log('OZmap MySQL mock on http://localhost:9994/api/v2')
})
