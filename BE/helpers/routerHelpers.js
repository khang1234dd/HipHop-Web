const Joi = require('@hapi/joi')

const validateBody = (schema) => {
    return (req, res, next) => {
        const validatorResult = schema.validate(req.body)

        if (validatorResult.error) {
            return res.status(400).json(validatorResult.error)
        } else {
            if (!req.value) req.value = {}
            if (!req.value['params']) req.value.params = {}

            req.value.body = validatorResult.value
            next()
        }
    }
}

const validateParam = (schema, name) => {
    return (req, res, next) => {
        const validatorResult = schema.validate({ param: req.params[name] })

        if (validatorResult.error) {
            return res.status(400).json(validatorResult.error)
        } else {
            if (!req.value) req.value = {}
            if (!req.value['params']) req.value.params = {}

            req.value.params[name] = req.params[name]
            next()
        }
    }
}

const schemas = {

    //auth validate
    authSignInSchema: Joi.object().keys({
        username: Joi.string().min(2).required(),
        password: Joi.string().min(6).required(),
    }),

    authSignUpSchema: Joi.object().keys({
        username: Joi.string().min(2).required(),
        password: Joi.string().min(6).required(),
        passwordconfirm: Joi.ref('password'),
        email: Joi.string().email().required()
    }),

    authCheckOtpFGSchema: Joi.object().keys({
        otp: Joi.string().min(6).max(6).required(),
    }),

}

module.exports = {
    validateBody,
    validateParam,
    schemas
}