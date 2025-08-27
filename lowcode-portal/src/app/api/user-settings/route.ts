import { NextRequest, NextResponse } from 'next/server';

interface UserSettings {
  id?: number;
  userId: string;
  fullName: string;
  email: string;
  company: string;
  createdAt?: string;
  updatedAt?: string;
}

// Mock data - replace with actual database calls
let userSettings: UserSettings[] = [
  {
    id: 1,
    userId: 'user-1',
    fullName: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Corp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// GET - Fetch user settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const settings = userSettings.find(us => us.userId === userId);
    
    if (!settings) {
      return NextResponse.json({
        success: false,
        error: 'User settings not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'User settings retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user settings'
    }, { status: 500 });
  }
}

// POST - Create/Update user settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName, email, company } = body;

    // Validation
    if (!userId || !userId.trim()) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Full Name is required'
      }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Check if user settings already exist
    const existingSettingsIndex = userSettings.findIndex(us => us.userId === userId);

    if (existingSettingsIndex !== -1) {
      // Update existing settings
      const updatedSettings: UserSettings = {
        ...userSettings[existingSettingsIndex],
        fullName: fullName.trim(),
        email: email.trim(),
        company: company?.trim() || '',
        updatedAt: new Date().toISOString(),
      };

      userSettings[existingSettingsIndex] = updatedSettings;

      // TODO: Update in database
      // await db.userSettings.update({
      //   where: { userId },
      //   data: {
      //     fullName: updatedSettings.fullName,
      //     email: updatedSettings.email,
      //     company: updatedSettings.company,
      //     updatedAt: new Date(),
      //   }
      // });

      return NextResponse.json({
        success: true,
        data: updatedSettings,
        message: 'User settings updated successfully'
      });
    } else {
      // Create new settings
      const newSettings: UserSettings = {
        id: Math.max(...userSettings.map(us => us.id || 0)) + 1,
        userId: userId.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        company: company?.trim() || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      userSettings.push(newSettings);

      // TODO: Save to database
      // await db.userSettings.create({
      //   data: {
      //     userId: newSettings.userId,
      //     fullName: newSettings.fullName,
      //     email: newSettings.email,
      //     company: newSettings.company,
      //   }
      // });

      return NextResponse.json({
        success: true,
        data: newSettings,
        message: 'User settings created successfully'
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error saving user settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save user settings'
    }, { status: 500 });
  }
}

// PUT - Update user settings (alternative method)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName, email, company } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required for update'
      }, { status: 400 });
    }

    const settingsIndex = userSettings.findIndex(us => us.userId === userId);
    
    if (settingsIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'User settings not found'
      }, { status: 404 });
    }

    // Update settings
    const updatedSettings = {
      ...userSettings[settingsIndex],
      fullName: fullName || userSettings[settingsIndex].fullName,
      email: email || userSettings[settingsIndex].email,
      company: company !== undefined ? company : userSettings[settingsIndex].company,
      updatedAt: new Date().toISOString(),
    };

    userSettings[settingsIndex] = updatedSettings;

    // TODO: Update in database
    // await db.userSettings.update({
    //   where: { userId },
    //   data: {
    //     fullName: updatedSettings.fullName,
    //     email: updatedSettings.email,
    //     company: updatedSettings.company,
    //     updatedAt: new Date(),
    //   }
    // });

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'User settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user settings'
    }, { status: 500 });
  }
}

// DELETE - Delete user settings
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required for deletion'
      }, { status: 400 });
    }

    const settingsIndex = userSettings.findIndex(us => us.userId === userId);
    
    if (settingsIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'User settings not found'
      }, { status: 404 });
    }

    const deletedSettings = userSettings[settingsIndex];
    userSettings = userSettings.filter(us => us.userId !== userId);

    // TODO: Delete from database
    // await db.userSettings.delete({
    //   where: { userId }
    // });

    return NextResponse.json({
      success: true,
      data: deletedSettings,
      message: 'User settings deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user settings'
    }, { status: 500 });
  }
}