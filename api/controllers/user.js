import db from "../../db/mysql.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


const getUserIdFromRequest = (req) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, "secretkey");
    return payload.userId;
  } catch (error) {
    return null;
  }
};

export const changePassword = async (req, res) => {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json("Not authenticated.");
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json("Current and new passwords are required.");
  }

  const connection = db.promise();


  try {
    // Verify current password
    const [userRows] = await connection.query(
      "SELECT password FROM Users WHERE idUsers = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json("User not found.");
    }

    const user = userRows[0];
    const isPasswordCorrect = bcrypt.compareSync(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(403).json("Current password is incorrect.");
    }

    // Update to new password
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    await connection.query(
      "UPDATE Users SET password = ? WHERE idUsers = ?",
      [hashedNewPassword, userId]
    );

    return res.status(200).json("Password updated successfully.");
  } catch (error) {
    return res.status(500).json("An error occurred while changing the password.");
  }
};

export const UpdateUser = async (req, res) => {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json("Not authenticated.");
  }

  const { email, address, country, city, zipcode } = req.body;
  let connection;

  try {
    connection = db.promise();
    await connection.query("START TRANSACTION");

    await connection.query(
      "UPDATE Users SET email = ? WHERE idUsers = ?",
      [email, userId]
    );

    const [addressUpdateResult] = await connection.query(
      "UPDATE Adresses SET adress = ?, Country = ?, city = ?, zipCode = ? WHERE idAdressUser = ?",
      [address, country, city, zipcode, userId]
    );

    if (addressUpdateResult.affectedRows === 0) {
      await connection.query(
        "INSERT INTO Adresses (idAdressUser, adress, Country, city, zipCode) VALUES (?, ?, ?, ?, ?)",
        [userId, address, country, city, zipcode]
      );
    }

    await connection.query("COMMIT");
    return res.status(200).json("User updated successfully.");
  } catch (error) {
    try {
      if (connection) {
        await connection.query("ROLLBACK");
      }
    } catch {
    }
    return res.status(500).json("An error occurred while updating the user.");
  }

};