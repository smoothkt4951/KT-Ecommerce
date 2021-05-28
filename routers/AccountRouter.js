const express = require('express');
const Router  = express.Router()
const Account = require('../models/AccountModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const registerValidator = require('./validator/registerValidator')
const loginValidator = require('./validator/loginValidator')

const { validationResult } = require('express-validator')
// Router.get('/', (req, res) => {
//     res.json({
//         code: 0,
//         message: 'Account Router'
//     })
// })


/* login
*/
// Router.get('/login', (req, res) =>{

//     if (req.session.user) {
//         return res.redirect('/')
//     }

//     const error = req.flash('error') || ''
//     const password = req.flash('name') || ''
//     const email = req.flash('email') || ''

//     res.render('login', {error, password, email})
// })
Router.post('/login', (req, res)=> {
    // res.json({
    //     code: 0,
    //     message: 'Login Route'
    // })
    let result = validationResult(req)
    if(result.errors.length === 0){
        let {email, password} = req.body
        let account = undefined

        Account.findOne({email: email})
        .then(acc => {
            if(!acc){
                // throw new Error('Email không tồn tại')
                // req.flash('error', 'Email không tồn tại')
                // req.flash('password', password)
                // req.flash('email', email)
                return res.redirect('/accounts/login')
            }
            account = acc
            return bcrypt.compare(password, acc.password)
        })
        .then(passwordMatch => {
            if(!passwordMatch){
                // return res.status(401).json({code: 3, message: 'Đăng nhập thất bại, mật khẩu không chính xác'})
                req.flash('error', 'Đăng nhập thất bại, mật khẩu không chính xác')
                req.flash('password', password)
                req.flash('email', email)
                return res.redirect('/accounts/login') 
            }
            const {JWT_SECRET} = process.env
            jwt.sign({
                email: account.email,
                fullname: account.fullname
            },JWT_SECRET, {
                expiresIn: '1h'
            }, (err, token) => {
                if(err) throw err
                // return res.json({
                //     code: 0,
                //     message: 'Đăng nhập thành công',
                //     token: token
                // })
                let user = results[0]
                    user.userRoot = `${req.vars.root}/users/${user.email}`
                    req.session.user = user
                    
                    req.app.use(express.static(user.userRoot))

                    return res.redirect('/')
            })
        })
        .catch(e =>{
            return res.status(401).json({code: 2, message: 'Đăng nhập thất bại ' + e.message})
        })
    }
    else{
        let messages = result.mapped()
        let message = ''
        for (m in messages){
            message = messages[m].msg
            break
        }
        // return res.json({code: 1, message: message})
        const{email, password} = req.body

        req.flash('error', message)
        req.flash('password', password)
        req.flash('email', email)

        res.redirect('/accounts/login')
    }
})
/* register

*/
Router.post('/register', registerValidator, (req, res)=> {
    let result = validationResult(req)
    if(result.errors.length === 0){

        let{email, password, fullname} = req.body
        Account.findOne({email: email})
        .then(acc => {
            if(acc){
                throw new Error('Tài khoản này đã tồn tại (email)')
            }
        })
        .then(() => bcrypt.hash(password, 10))
        .then(hashed =>{

            let user = new Account({
                email: email,
                password: hashed,
                fullname: fullname
            })
            return user.save();
        })
        .then(() =>{
            return res.json({code: 0, message: 'Đăng ký tài khoản thành công'})
        })
        .catch(e =>{
            return res.json({code: 2, message: 'Đăng ký tài khoản thất bại. '+ e.message})
        })
           
    }
    else{
        let messages = result.mapped()
        let message = ''
        for (m in messages){
            message = messages[m].msg
            break
        }
        return res.json({code: 1, message: message})
    }
    
})
module.exports = Router

function checkUserAndGenerateToken(data, req, res) {
    jwt.sign({ user: data.username, id: data._id }, 'hoangkienthiet1000097742827048624951702187', { expiresIn: '1d' }, (err, token) => {
      if (err) {
        res.status(400).json({
          status: false,
          errorMessage: err,
        });
      } else {
        res.json({
          message: 'Login Successfully.',
          token: token,
          status: true
        });
      }
    });
}