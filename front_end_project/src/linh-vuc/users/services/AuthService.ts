/**
 * Authentication Service
 * Xác thực và phân quyền người dùng
 */

import { User, LoginCredentials, UserRole } from '../entities/User'

export class AuthService {
  private readonly MOCK_USERS: Array<{
    username: string
    password: string
    user: User
  }> = [
    {
      username: 'admin',
      password: 'admin123',
      user: {
        id: '1',
        username: 'admin',
        fullName: 'Quản Trị Viên',
        email: 'admin@grocery.com',
        role: 'admin',
        createdAt: new Date(),
      },
    },
    {
      username: 'staff',
      password: 'staff123',
      user: {
        id: '2',
        username: 'staff',
        fullName: 'Nhân Viên Bán Hàng',
        email: 'staff@grocery.com',
        role: 'staff',
        createdAt: new Date(),
      },
    },
    {
      username: 'manager',
      password: 'manager123',
      user: {
        id: '3',
        username: 'manager',
        fullName: 'Quản Lý',
        email: 'manager@grocery.com',
        role: 'manager',
        createdAt: new Date(),
      },
    },
    {
      username: 'accountant',
      password: 'accountant123',
      user: {
        id: '4',
        username: 'accountant',
        fullName: 'Kế Toán',
        email: 'accountant@grocery.com',
        role: 'accountant',
        createdAt: new Date(),
      },
    },
  ]

  async login(credentials: LoginCredentials): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const account = this.MOCK_USERS.find(
          (u) =>
            u.username === credentials.username &&
            u.password === credentials.password
        )

        if (account) {
          resolve(account.user)
        } else {
          reject(new Error('Tên đăng nhập hoặc mật khẩu không đúng'))
        }
      }, 500)
    })
  }

  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 100)
    })
  }

  hasPermission(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return roles.includes(userRole)
  }

  canDeleteProduct(userRole: UserRole): boolean {
    return userRole === 'admin'
  }

  canEditProduct(userRole: UserRole): boolean {
    return userRole === 'admin' || userRole === 'manager'
  }

  canCreateProduct(userRole: UserRole): boolean {
    return userRole === 'admin' || userRole === 'manager'
  }

  canViewReports(userRole: UserRole): boolean {
    return userRole === 'admin' || userRole === 'manager' || userRole === 'accountant'
  }

  canExportReports(userRole: UserRole): boolean {
    return userRole === 'admin' || userRole === 'accountant'
  }

  canCreateOrder(userRole: UserRole): boolean {
    return userRole === 'admin' || userRole === 'staff'
  }

  canCreatePurchase(userRole: UserRole): boolean {
    return userRole === 'admin' || userRole === 'manager'
  }

  canViewOrders(userRole: UserRole): boolean {
    return userRole === 'admin' || userRole === 'manager' || userRole === 'accountant'
  }

  canViewPurchases(userRole: UserRole): boolean {
    return userRole === 'admin' || userRole === 'manager' || userRole === 'accountant'
  }

  canManageUsers(userRole: UserRole): boolean {
    return userRole === 'admin'
  }
}

