const bcrypt = require('bcryptjs');


module.exports = {
    signup: (req, res) => {
        const { email, password } = req.body;
        const db = req.app.get("db");
    
        db.check_user_exists([email])
          .then((data) => {
            if (data[0]) {
              //# this means a user with this email already exists
              return res.status(200).send("Email already exists");
            } else {
              //# this means no user exists with this email
              const salt = bcrypt.genSaltSync(10);
              const hash = bcrypt.hashSync(password, salt);
              db.create_user([email, hash]).then((data) => {
                req.session.user = { id: data[0].id, email: data[0].email };
                res.status(200).send(req.session.user);
              });
            }
          })
          .catch((err) => {
            res.status(500).send("Error checking email");
          });
      },

    login: (req, res) => {
        const {email, password} = req.body;
        const db = req.app.get('db');

        db.check_user_exists([email]).then(data => {
            if(!data[0]) {
                //tell them no user with that email exists
                res.status(200).send("Incorrect email. Please try again")
            } else {
                //check to see if the password matches the stored password
                //authenticated will be a bool (true or false)
                const authenticated = bcrypt.compareSync(password, data[0].user_password);

                if(authenticated) {
                    //log them in
                    //another way of assigning user to the session without the password
                    delete data[0].user_password
                    req.session.user = data[0];
                    res.status(200).send(req.session.user);
                } else {
                    //password is incorrect
                    res.status(401).send("Incorrect email/password");
                }

            }
        });
    },

    logout: (req, res) => {
        req.session.destroy();
        res.sendStatus(200);
    },

    user: (req, res) => {
        if(req.session.user) {
            res.status(200).send(req.session.user)
        } else {
            res.status(401).send("Please Login")
        }
    }
}