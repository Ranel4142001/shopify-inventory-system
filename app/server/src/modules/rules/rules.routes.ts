import { Router } from 'express';
import { rulesController } from './rules.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

// All rules routes require authentication
router.use(requireAuth);

// GET  /api/rules         — list all group buys (paginated)
router.get('/', (req, res, next) =>
  rulesController.getAll(req, res, next)
);

// GET  /api/rules/:id     — get single group buy with details
router.get('/:id', (req, res, next) =>
  rulesController.getById(req, res, next)
);

// POST /api/rules         — create new group buy
router.post('/', (req, res, next) =>
  rulesController.create(req, res, next)
);

// PUT  /api/rules/:id     — update group buy
router.put('/:id', (req, res, next) =>
  rulesController.update(req, res, next)
);

// DELETE /api/rules/:id   — delete group buy
router.delete('/:id', (req, res, next) =>
  rulesController.remove(req, res, next)
);

export default router;