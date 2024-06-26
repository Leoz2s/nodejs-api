const AppError = require("../utils/AppError");
const {hash, compare} = require("bcryptjs");

const sqliteConnection = require("../database/sqlite");

const UserRepository = require("../repositories/UserRepository");
const UserCreateService = require("../services/UserCreateService");

class UsersController {
  async create(request, response) {
    const {name, email, password} = request.body;

    const userRepository = new UserRepository();
    const userCreateService = new UserCreateService(userRepository);
    await userCreateService.execute({name, email, password});

    return response.status(201).json("User created.");
    // // response.send(`Name: ${name}. E-mail: ${email}. Password: ${password}.`);
    // response.status(201).json({name, email, password});
  };

  async update(request, response) {
    const {name, email, password, old_password} = request.body;
    // const {id} = request.params;
    const user_id = request.user.id;

    const database = await sqliteConnection();
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id]);

    if(!user) {
      throw new AppError("User not found.");
    };

    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);
    if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("This e-mail is already in use.");
    };

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if(password && !old_password){
      throw new AppError("You need to inform the current password to change to a new one.");
    }else if(password && old_password){
      const checkOldPassword = await compare(old_password, user.password);

      if(!checkOldPassword){
        throw new AppError("The current password is incorrect.");
      };

      user.password = await hash(password, 8);
    };

    await database.run(`
      UPDATE users SET 
      name = ?,
      email = ?,
      password= ?,
      updated_at = DATETIME('now')
      WHERE id = ?`,
      [user.name, user.email, user.password, user.id]
    );

    return response.status(200).json();
  };
};

module.exports = UsersController;