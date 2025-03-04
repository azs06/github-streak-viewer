import { ALLOWED_USERS } from "../../config/config.js";

const addUserControl = (req, res, next) => {
  const { username } = req.params;

  if (
    username &&
    ALLOWED_USERS &&
    ALLOWED_USERS.length > 0 &&
    !ALLOWED_USERS.includes(username)
  ) {
    return res.status(403).send("User not allowed");
  }
  next();
};

export { addUserControl };
