import express from 'express';
import {
    createBranch,
    getAllBranches,
    findNearestBranch,
    getBranchById,
    updateBranch,
    deleteBranch
} from '../controllers/branchController.js';

const router = express.Router();

// Route cho /
router.route('/')
    .post(createBranch)
    .get(getAllBranches);

// Route cho /nearest (phải đặt trước /:id)
router.route('/nearest')
    .get(findNearestBranch);

// Route cho /:id
router.route('/:id')
    .get(getBranchById)
    .put(updateBranch)
    .delete(deleteBranch);

export default router;