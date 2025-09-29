import express from 'express';
import { userService, UserProfileUpdate, AccountUpdate, UserPreferences } from '../services/user.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(authMiddleware);

// GET /user/profile - Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await userService.getUserProfile(userId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }

  } catch (error) {
    console.error('Get profile route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /user/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const updates: UserProfileUpdate = req.body;

    // Validate input
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided'
      });
    }

    // Validate email format if provided
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address'
        });
      }
    }

    // Validate role if provided
    if (updates.role) {
      const validRoles = ['owner', 'admin', 'dispatcher', 'technician', 'accountant'];
      if (!validRoles.includes(updates.role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }
    }

    const result = await userService.updateUserProfile(userId, updates);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Update profile route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /user/account - Update account information
router.put('/account', async (req, res) => {
  try {
    const accountId = req.user?.accountId;
    const userRole = req.user?.role;
    
    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Only owners and admins can update account information
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update account information'
      });
    }

    const updates: AccountUpdate = req.body;

    // Validate input
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided'
      });
    }

    const result = await userService.updateAccount(accountId, updates);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Update account route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /user/preferences - Get user preferences
router.get('/preferences', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await userService.getUserPreferences(userId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }

  } catch (error) {
    console.error('Get preferences route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /user/preferences - Update user preferences
router.put('/preferences', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const preferences: Partial<UserPreferences> = req.body;

    // Validate input
    if (!preferences || Object.keys(preferences).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No preference data provided'
      });
    }

    const result = await userService.updateUserPreferences(userId, preferences);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Update preferences route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


// GET /user/team - Get account team members
router.get('/team', async (req, res) => {
  try {
    const accountId = req.user?.accountId;
    const userRole = req.user?.role;
    
    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Only owners and admins can view team members
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view team members'
      });
    }

    const result = await userService.getAccountTeamMembers(accountId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }

  } catch (error) {
    console.error('Get team route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /user/export-data - Export account data (Owner only)
router.post('/export-data', async (req, res) => {
  try {
    const accountId = req.user?.accountId;
    const userRole = req.user?.role;
    
    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Only owners can export account data
    if (userRole !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only account owners can export account data'
      });
    }

    const result = await userService.exportAccountData(accountId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Export data route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /user/account - Delete account (Owner only)
router.delete('/account', async (req, res) => {
  try {
    const accountId = req.user?.accountId;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!accountId || !userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Only owners can delete the account
    if (userRole !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only account owners can delete the account'
      });
    }

    const { confirmation } = req.body;
    
    if (confirmation !== 'DELETE_ACCOUNT') {
      return res.status(400).json({
        success: false,
        message: 'Account deletion requires proper confirmation'
      });
    }

    const result = await userService.deleteAccount(accountId, userId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Delete account route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
