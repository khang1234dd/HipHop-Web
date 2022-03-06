const User = require("../models/User");
const { sendMail } = require("../common/mailer");
const otpGenerator = require("otp-generator");
const { enpass } = require("../common/enpass");
const JWT = require("jsonwebtoken");
const { JWT_SECRET, CLIENT_URL } = require("../config/index");

const encodedToken = (userID) => {
  return JWT.sign(
    {
      iss: "ProjectCNPMM",
      sub: userID,
      iat: new Date().getTime(),
      exp: new Date().setDate(new Date().getDate() + 3),
    },
    JWT_SECRET
  );
};

const secret = async (req, res, next) => {
  return res.status(200).json({ resource: true });
};

const signIn = async (req, res, next) => {

  const {username, password} = req.value.body

  const user = await User.findOne({ username });

  if (!user) return res.status(400).json({message: 'Your username is invalid .Try again !'})
  if (user.lock) return res.status(403).json({message: 'Your ID has been locked!'})

  const isCorrectPassword = await user.isValidPassword(password);

  if (!isCorrectPassword) return res.status(400).json({message: 'Password is not correct!'})

  //Assign a token
  const token = encodedToken(user._id);
  res.setHeader("Authorization", token);
  return res.status(200).json({ success: true, token: token });
};

const signUp = async (req, res, next) => {
  const { username, password, email } = req.value.body;

  const foundEmail = await User.findOne({ email });
  if (foundEmail)
    return res.status(409).json({ err: { message: "Email is already" } });

  const foundUserName = await User.findOne({ username });
  if (foundUserName)
    return res.status(409).json({ err: { message: "UserName is already" } });

  const password1 = await enpass(password);

  const otp = otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
  });

  const body = `<h2>this is your otp code </h2>
                <p>${otp}</p>
                <p>Trân trọng</p>
                `;
  await sendMail(email, "Sign Up", body);

  const newUser = new User({
    username,
    password: password1,
    email,
    name: username,
    otpFG: otp,
  });

  await newUser.save();
  
  //Encode  a token
  const token = encodedToken(newUser._id);

  res.setHeader("Authorization", token);

  return res.status(201).json({ success: true });
};

const checkOtpSignUp = async (req, res, next) => {
  const { otp } = req.value.body;

  const user = await User.findOne({otpFG: otp})
  if (!user)
    return res
      .status(404)
      .json({ message: "wrong otp" });
  
  if(user.activate) return res.status(400).json({message: 'email have activated'})

  user.activate = true;
  await user.save()

  return res.status(200).json({ success: true, message: 'account activated successfully'});
};


module.exports = {
  secret,
  signIn,
  signUp,
  checkOtpSignUp,
};
