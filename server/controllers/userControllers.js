// controllers/userController.js
const userModel = require("../models/User");

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        message: "Search query must be at least 2 characters" 
      });
    }

    const searchTerm = q.trim().toLowerCase();
    
    // 1. ESCAPE SPECIAL CHARACTERS (Security)
    const safeRegex = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // 2. GET CURRENT USER'S BLOCK LISTS
    const currentUser = req.user;
    const blockedIds = currentUser.blockedUsers || [];
    const blockedBy = currentUser.blockedBy || [];

    // 3. SEARCH ONLY IN:
    //    - username field
    //    - LOCAL PART of email (before @ symbol)
    const users = await userModel.aggregate([
      {
        $match: {
          $and: [
            { _id: { $ne: currentUser._id } },
            { _id: { $nin: blockedIds } },
            { _id: { $nin: blockedBy } }
          ]
        }
      },
      {
        $addFields: {
          // Extract email local part (before @)
          emailLocal: {
            $arrayElemAt: [
              { $split: [{ $toLower: "$email" }, "@"] },
              0
            ]
          }
        }
      },
      {
        $match: {
          $or: [
            { username: { $regex: safeRegex, $options: 'i' } },
            { emailLocal: { $regex: safeRegex, $options: 'i' } }
          ]
        }
      },
      {
        $project: {
          password: 0,          // Never include
          email: 0,             // Never include full email
          blockedUsers: 0,      // Privacy
          blockedBy: 0          // Privacy
        }
      },
      { $limit: 15 }
    ]);

    res.status(200).json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ 
      message: "Could not complete search",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

module.exports = { searchUsers };