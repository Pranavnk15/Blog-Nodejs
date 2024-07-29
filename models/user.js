const { createHmac, randomBytes } = require('crypto'); //built in package

const { Schema, model } = require('mongoose');
const { createTokenForUser } = require('../services/authentication');

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
        // required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        default: "/images/default.png"
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    }
}, { timestamps: true });


//middleware to save and perform hashing
userSchema.pre('save', function (next) {
    const user = this;

    //will check if the passowrd is modified or not
    if (!user.isModified('password')) return;

    //this will secret a salt for everyuser, its like a secret key of 16 digits
    // using this secret key will salt the passowrd to make a hasedpassowrd
    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac("sha256", salt).update(user.password).digest('hex');

    //then will update the salt and the hashedpassword
    this.salt = salt;
    this.password = hashedPassword;

    next();
})

//below is a virtual function
userSchema.static('matchPasswordAndGenerateToken',async function(email, password)  {
    const user = await this.findOne({email});
    if(!user) throw new Error("User not found!");
    console.log(user);

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt).update(password).digest('hex');

    if(hashedPassword !== userProvidedHash) throw new Error("Incorrect Passwowrd")
    //if matched passowrd we will return user object
    // return user;
    
    const token = createTokenForUser(user);
    return token;
})

const User = model('user', userSchema);

module.exports = User;