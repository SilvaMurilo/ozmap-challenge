import express, { Request, Response, NextFunction } from 'express'
import { createCableService, getCableService } from '../src/services/cableService';
import { createBoxService, getBoxService } from '../src/services/boxService';
import { createProspectService, getProspectService } from '../src/services/prospectService';

const app = express();
app.use(express.json());

app.get('/api/v2/health', (_req: Request, res: Response) => res.json({ ok: true }))

app.post('/api/v2/cables', async (req: Request, res: Response) => {  
    const result = await createCableService(req.body);
    console.log('Created cable:', result);
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

// GET /api/v2/cables/123?cable_type=fiber
app.get('/api/v2/cables/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const cableType = req.query.cable_type as string;

    if (!id || !cableType) {
      return res.status(400).json({ error: 'id and cable_type are required' });
    }
    const result = await getCableService(cableType, id);
    if (!result) return res.status(404).json({ error: 'Cable not found' });

    return res.json(result);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/v2/boxes/:id', async (req: Request, res: Response) => {  
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    const result = await getBoxService(id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    return res.json(result);
});

app.get('/api/v2/prospects/:id', async (req: Request, res: Response) => {  
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    const result = await getProspectService(id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    return res.json(result);
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // console.error(err)
  res.status(500).json({ error: err?.message ?? 'Erro interno' })
})

app.listen(9994, () => {
  console.log('OZmap MySQL mock on http://localhost:9994/api/v2')
})
