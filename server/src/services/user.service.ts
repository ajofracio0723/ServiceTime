import { query } from '../config/database';
import { User, Account } from '../types/auth';

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
}

export interface AccountUpdate {
  name?: string;
  business_type?: string;
}

export interface UserPreferences {
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    job_updates: boolean;
    payment_reminders: boolean;
    client_messages: boolean;
    system_alerts: boolean;
  };
  branding: {
    business_name: string;
    logo_url: string;
    primary_color: string;
    secondary_color: string;
  };
  business_hours: {
    [key: string]: {
      enabled: boolean;
      open: string;
      close: string;
    };
  };
  tax_settings: {
    tax_id: string;
    default_rate: number;
    tax_inclusive: boolean;
  };
  invoice_settings: {
    template_style: string;
    numbering_prefix: string;
    next_number: number;
    terms: string;
    footer_note: string;
    accent_color: string;
    date_format: string;
    paper_size: string;
    show_logo: boolean;
    show_summary: boolean;
    show_payment_terms: boolean;
  };
}

export class UserService {
  
  // Get user profile with account information
  async getUserProfile(userId: string): Promise<{ success: boolean; message: string; user?: User; account?: Account }> {
    try {
      const result = await query(
        `SELECT u.*, a.name as account_name, a.business_type, a.subscription_plan, a.status as account_status,
                a.created_at as account_created_at, a.updated_at as account_updated_at
         FROM users u 
         JOIN accounts a ON u.account_id = a.id 
         WHERE u.id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const userData = result.rows[0];
      const user: User = {
        id: userData.id,
        account_id: userData.account_id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        status: userData.status,
        email_verified: userData.email_verified,
        last_login: userData.last_login,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };

      const account: Account = {
        id: userData.account_id,
        name: userData.account_name,
        business_type: userData.business_type,
        subscription_plan: userData.subscription_plan,
        status: userData.account_status,
        created_at: userData.account_created_at,
        updated_at: userData.account_updated_at
      };

      return {
        success: true,
        message: 'User profile retrieved successfully',
        user,
        account
      };

    } catch (error) {
      console.error('Error getting user profile:', error);
      return {
        success: false,
        message: 'Failed to retrieve user profile'
      };
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: UserProfileUpdate): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Build dynamic update query
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.first_name !== undefined) {
        updateFields.push(`first_name = $${paramIndex++}`);
        values.push(updates.first_name);
      }
      if (updates.last_name !== undefined) {
        updateFields.push(`last_name = $${paramIndex++}`);
        values.push(updates.last_name);
      }
      if (updates.email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`);
        values.push(updates.email);
      }
      if (updates.role !== undefined) {
        updateFields.push(`role = $${paramIndex++}`);
        values.push(updates.role);
      }

      if (updateFields.length === 0) {
        return {
          success: false,
          message: 'No valid fields to update'
        };
      }

      // Add updated_at timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);

      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING *
      `;

      const result = await query(updateQuery, values);

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const user: User = result.rows[0];

      return {
        success: true,
        message: 'User profile updated successfully',
        user
      };

    } catch (error) {
      console.error('Error updating user profile:', error);
      
      // Handle unique constraint violations (e.g., email already exists)
      if (error instanceof Error && error.message.includes('unique constraint')) {
        return {
          success: false,
          message: 'Email address is already in use'
        };
      }

      return {
        success: false,
        message: 'Failed to update user profile'
      };
    }
  }

  // Update account information
  async updateAccount(accountId: string, updates: AccountUpdate): Promise<{ success: boolean; message: string; account?: Account }> {
    try {
      // Build dynamic update query
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        values.push(updates.name);
      }
      if (updates.business_type !== undefined) {
        updateFields.push(`business_type = $${paramIndex++}`);
        values.push(updates.business_type);
      }

      if (updateFields.length === 0) {
        return {
          success: false,
          message: 'No valid fields to update'
        };
      }

      // Add updated_at timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(accountId);

      const updateQuery = `
        UPDATE accounts 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING *
      `;

      const result = await query(updateQuery, values);

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Account not found'
        };
      }

      const account: Account = result.rows[0];

      return {
        success: true,
        message: 'Account updated successfully',
        account
      };

    } catch (error) {
      console.error('Error updating account:', error);
      return {
        success: false,
        message: 'Failed to update account'
      };
    }
  }

  // Get user preferences (stored as JSON in a separate table)
  async getUserPreferences(userId: string): Promise<{ success: boolean; message: string; preferences?: UserPreferences }> {
    try {
      // First, check if preferences table exists, if not create it
      await query(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          preferences JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id)
        )
      `);

      const result = await query(
        'SELECT preferences FROM user_preferences WHERE user_id = $1',
        [userId]
      );

      let preferences: UserPreferences;

      if (result.rows.length === 0) {
        // Return default preferences if none exist
        preferences = {
          notifications: {
            email_notifications: true,
            sms_notifications: false,
            push_notifications: true,
            job_updates: true,
            payment_reminders: true,
            client_messages: true,
            system_alerts: false
          },
          branding: {
            business_name: 'ServiceTime Solutions',
            logo_url: '/LOGO.png',
            primary_color: '#2563eb',
            secondary_color: '#111827'
          },
          business_hours: {
            mon: { enabled: true, open: '09:00', close: '17:00' },
            tue: { enabled: true, open: '09:00', close: '17:00' },
            wed: { enabled: true, open: '09:00', close: '17:00' },
            thu: { enabled: true, open: '09:00', close: '17:00' },
            fri: { enabled: true, open: '09:00', close: '17:00' },
            sat: { enabled: false, open: '09:00', close: '13:00' },
            sun: { enabled: false, open: '09:00', close: '13:00' }
          },
          tax_settings: {
            tax_id: '12-3456789',
            default_rate: 8.5,
            tax_inclusive: false
          },
          invoice_settings: {
            template_style: 'Modern',
            numbering_prefix: 'INV-',
            next_number: 1001,
            terms: 'Payment due within 15 days.',
            footer_note: 'Thank you for your business!',
            accent_color: '#2563eb',
            date_format: 'MM/DD/YYYY',
            paper_size: 'Letter',
            show_logo: true,
            show_summary: true,
            show_payment_terms: true
          }
        };
      } else {
        preferences = result.rows[0].preferences;
      }

      return {
        success: true,
        message: 'User preferences retrieved successfully',
        preferences
      };

    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        success: false,
        message: 'Failed to retrieve user preferences'
      };
    }
  }

  // Update user preferences
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<{ success: boolean; message: string; preferences?: UserPreferences }> {
    try {
      // Get current preferences first
      const currentResult = await this.getUserPreferences(userId);
      if (!currentResult.success) {
        return currentResult;
      }

      // Merge with new preferences
      const updatedPreferences = {
        ...currentResult.preferences,
        ...preferences
      };

      // Upsert preferences
      const result = await query(`
        INSERT INTO user_preferences (user_id, preferences, updated_at) 
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          preferences = $2,
          updated_at = CURRENT_TIMESTAMP
        RETURNING preferences
      `, [userId, JSON.stringify(updatedPreferences)]);

      return {
        success: true,
        message: 'User preferences updated successfully',
        preferences: result.rows[0].preferences
      };

    } catch (error) {
      console.error('Error updating user preferences:', error);
      return {
        success: false,
        message: 'Failed to update user preferences'
      };
    }
  }


  // Get account team members (other users in the same account)
  async getAccountTeamMembers(accountId: string): Promise<{ success: boolean; message: string; team_members?: User[] }> {
    try {
      const result = await query(
        `SELECT id, email, first_name, last_name, role, status, email_verified, last_login, created_at, updated_at
         FROM users 
         WHERE account_id = $1 
         ORDER BY created_at ASC`,
        [accountId]
      );

      const teamMembers: User[] = result.rows.map(row => ({
        id: row.id,
        account_id: row.account_id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        role: row.role,
        status: row.status,
        email_verified: row.email_verified,
        last_login: row.last_login,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      return {
        success: true,
        message: 'Team members retrieved successfully',
        team_members: teamMembers
      };

    } catch (error) {
      console.error('Error getting team members:', error);
      return {
        success: false,
        message: 'Failed to retrieve team members'
      };
    }
  }

  // Export account data (Owner only)
  async exportAccountData(accountId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Get account information
      const accountResult = await query(
        'SELECT * FROM accounts WHERE id = $1',
        [accountId]
      );

      if (accountResult.rows.length === 0) {
        return {
          success: false,
          message: 'Account not found'
        };
      }

      // Get all users in the account
      const usersResult = await query(
        'SELECT id, email, first_name, last_name, role, status, email_verified, last_login, created_at FROM users WHERE account_id = $1',
        [accountId]
      );

      // Get user preferences
      const preferencesResult = await query(
        'SELECT user_id, preferences FROM user_preferences WHERE user_id IN (SELECT id FROM users WHERE account_id = $1)',
        [accountId]
      );

      // Compile export data
      const exportData = {
        account: accountResult.rows[0],
        users: usersResult.rows,
        preferences: preferencesResult.rows,
        export_date: new Date().toISOString(),
        export_version: '1.0'
      };

      return {
        success: true,
        message: 'Account data exported successfully',
        data: exportData
      };

    } catch (error) {
      console.error('Error exporting account data:', error);
      return {
        success: false,
        message: 'Failed to export account data'
      };
    }
  }

  // Delete account (Owner only) - DANGEROUS OPERATION
  async deleteAccount(accountId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verify the user is the owner of this account
      const userResult = await query(
        'SELECT role FROM users WHERE id = $1 AND account_id = $2',
        [userId, accountId]
      );

      if (userResult.rows.length === 0 || userResult.rows[0].role !== 'owner') {
        return {
          success: false,
          message: 'Only account owners can delete the account'
        };
      }

      // Start transaction for safe deletion
      await query('BEGIN');

      try {
        // Delete user preferences first (due to foreign key constraints)
        await query(
          'DELETE FROM user_preferences WHERE user_id IN (SELECT id FROM users WHERE account_id = $1)',
          [accountId]
        );

        // Delete user OTPs
        await query(
          'DELETE FROM user_otps WHERE user_id IN (SELECT id FROM users WHERE account_id = $1)',
          [accountId]
        );

        // Delete user sessions
        await query(
          'DELETE FROM user_sessions WHERE user_id IN (SELECT id FROM users WHERE account_id = $1)',
          [accountId]
        );

        // Delete users (this will cascade to related tables)
        await query('DELETE FROM users WHERE account_id = $1', [accountId]);

        // Finally delete the account
        await query('DELETE FROM accounts WHERE id = $1', [accountId]);

        // Commit transaction
        await query('COMMIT');

        return {
          success: true,
          message: 'Account deleted successfully'
        };

      } catch (deleteError) {
        // Rollback transaction on error
        await query('ROLLBACK');
        throw deleteError;
      }

    } catch (error) {
      console.error('Error deleting account:', error);
      return {
        success: false,
        message: 'Failed to delete account. Please contact support.'
      };
    }
  }
}

export const userService = new UserService();
