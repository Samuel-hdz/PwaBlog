import { errorHandler } from "../utils/error.js"
import bcryptjs from 'bcryptjs'
import User from '../models/user.model.js'
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const updateUser = async (req, res, next) => {
    if(req.user.id !== req.params.userId){
        return next(errorHandler(403, "No puedes actualizar este usuario"))
    }
    if(req.body.password){
        if(req.body.password.length < 6){
            return next(errorHandler(400, 'la contrasena debe de contener al menos 6 caracteres'))
        }
        req.body.password = bcryptjs.hashSync(req.body.password, 10)
    }

    if(req.body.username){
        if(req.body.username.length < 7 || req.body.username.length > 20){
            return next(errorHandler(400, 'El usuario debe de contener entre 7 y 20 caracteres'))
        }
        if(req.body.username.includes(' ')){
            return next(errorHandler(400, 'El usuario no puede tener espacios en blanco'))
        }
    }

    try {
        const updateUser = await User.findByIdAndUpdate(req.params.userId, {
            $set: {
                username: req.body.username,
                email: req.body.email,
                profilePicture: req.body.profilePicture,
                password: req.body.password,
            },
        }, {new: true} );

        const {password, ...rest} = updateUser._doc;
        res.status(200).json(rest)

    } catch (error) {
        next(error)
    }
}

export const deleteUser = async (req, res, next) => {
    console.log("1", req.user.isAdmin)
    console.log("2", req.user.id)
    console.log("3", req.params.userId)
    if(!req.user.isAdmin && req.user.id !== req.params.userId){
        return next(errorHandler(403, "No puedes eliminar este usuario"))
    }
    try {
        await User.findByIdAndDelete(req.params.userId)
        res.status(200).json('El usuario ha sido eliminado')
    } catch (error) {
        next(error)   
    }
}

export const signout = async (req, res, next) => {
    try {
        res.clearCookie('access_token').status(200).json('El usuario ha cerrado sesion')
    } catch (error) {
        next(error)
    }
}

export const getUsers = async (req, res, next) => {
    if(!req.user.isAdmin){
        return next(errorHandler(403, "No tienes permitido ver a los usuarios"))
    }
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;

        const users = await User.find()
            .sort({ createdAt: sortDirection })
            .skip(startIndex)
            .limit(limit);

        const userWithoutPassword = users.map((user) => {
            const { password, ...rest } = user._doc;
            return rest;
        })

        const totalUsers = await User.countDocuments();
        const now = new Date();

        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
        );

        const lastMonthUsers = await User.countDocuments({
            createdAt: { $gte: oneMonthAgo },
        });

        res.status(200).json({
            users: userWithoutPassword,
            totalUsers,
            lastMonthUsers,
        });

    } catch (error) {
        next(error)
    }
}

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId)
        if(!user){
            return next(errorHandler(404, 'Usuario no encontrado'))
        }
        const { password, ...rest } = user._doc;
        res.status(200).json(rest)
    } catch (error) {
        next(error)
    }
}

export const checkoutSession = async (req, res, next) => {
    const userId = req.user.id || 'anonymous';
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 10000,
            currency: 'mxn',
            automatic_payment_methods: { enabled: true },
            metadata: {
              userId: userId,
            },
          });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
        console.log(paymentIntent)
      } catch (err) {
        console.error('Stripe error:', err);
        res.status(500).json({ error: 'No se pudo crear el PaymentIntent' });
      }
}

export const webhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const customerId = paymentIntent.metadata.userId;
  
      console.log('💰 Pago exitoso para usuario:', customerId);
  
      try {
        const user = await User.findById(customerId);
        if (!user) {
          console.error('❌ Usuario no encontrado');
          return res.status(404).send('Usuario no encontrado');
        }
  
        user.isSubscribed = true;
        await user.save();
  
        console.log('✅ Usuario actualizado como suscrito');
      } catch (error) {
        console.error('❌ Error actualizando usuario:', error.message);
      }
    }
  
    res.status(200).json({ received: true });
  };