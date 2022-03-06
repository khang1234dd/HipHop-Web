const router = require('express-promise-router')()

const authenticateController = require('../controllers/authenticate')

const { validateBody, validateParam, schemas } = require('../helpers/routerHelpers')

const {authenToken} = require('../middlewares/verifyToken')

router.route('/secret').get(authenToken,authenticateController.secret)
router.route('/signin').post(validateBody(schemas.authSignInSchema),authenticateController.signIn)
router.route('/signup').post(validateBody(schemas.authSignUpSchema), authenticateController.signUp)
router.route('/checkotpsignup').post(validateBody(schemas.authCheckOtpFGSchema),authenticateController.checkOtpSignUp)


module.exports = router