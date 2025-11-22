import express from 'express';
import {updateUser, deleteUser, signout, getUsers, getUser, checkoutSession, webhook } from '../controller/user.controller.js';
import { verifyUser } from '../utils/verifyUser.js';

const router = express.Router();

router.put('/update/:userId', verifyUser ,updateUser)
router.delete('/delete/:userId', verifyUser, deleteUser)
router.post('/signout', signout)
router.get('/getusers', verifyUser, getUsers)
router.get('/:userId', getUser)
router.post('/create-payment-intent', verifyUser, checkoutSession)

router.post('/webhook', webhook);

export default router