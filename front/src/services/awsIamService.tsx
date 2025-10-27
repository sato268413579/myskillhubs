import React from 'react';

// AWS IAM関連の型定義
export interface IAMUser {
  id: string;
  userName: string;
  arn: string;
  createDate: string;
  lastActivity?: string;
  status: 'Active' | 'Inactive';
  mfaEnabled: boolean;
  tags: { [key: string]: string };
}

export interface IAMPolicy {
  id: string;
  policyName: string;
  policyArn: string;
  description?: string;
  policyDocument: any;
  attachmentCount: number;
  isAWSManaged: boolean;
  createDate: string;
  updateDate?: string;
}

export interface IAMGroup {
  id: string;
  groupName: string;
  arn: string;
  createDate: string;
  attachedPolicies: string[];
  memberCount: number;
}

export interface IAMRole {
  id: string;
  roleName: string;
  arn: string;
  description?: string;
  assumeRolePolicyDocument: any;
  attachedPolicies: string[];
  createDate: string;
  maxSessionDuration: number;
}

export interface PermissionVisualization {
  userId: string;
  permissions: {
    service: string;
    actions: string[];
    resources: string[];
    effect: 'Allow' | 'Deny';
    condition?: any;
  }[];
  inheritedFrom: {
    type: 'User' | 'Group' | 'Role';
    name: string;
    policyName: string;
  }[];
}

// AWS IAMサービスクラス
class AWSIAMService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  }

  // ユーザー管理
  async getAllUsers(): Promise<IAMUser[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`ユーザー取得エラー: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ユーザー取得に失敗しました:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<IAMUser> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`ユーザー詳細取得エラー: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ユーザー詳細取得に失敗しました:', error);
      throw error;
    }
  }

  async createUser(userData: Partial<IAMUser>): Promise<IAMUser> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error(`ユーザー作成エラー: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ユーザー作成に失敗しました:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<IAMUser>): Promise<IAMUser> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error(`ユーザー更新エラー: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ユーザー更新に失敗しました:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`ユーザー削除エラー: ${response.statusText}`);
      }
    } catch (error) {
      console.error('ユーザー削除に失敗しました:', error);
      throw error;
    }
  }

  // ポリシー管理
  async getAllPolicies(): Promise<IAMPolicy[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/policies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`ポリシー取得エラー: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ポリシー取得に失敗しました:', error);
      throw error;
    }
  }

  async createPolicy(policyData: Partial<IAMPolicy>): Promise<IAMPolicy> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(policyData)
      });
      
      if (!response.ok) {
        throw new Error(`ポリシー作成エラー: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ポリシー作成に失敗しました:', error);
      throw error;
    }
  }

  // グループ管理
  async getAllGroups(): Promise<IAMGroup[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/groups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`グループ取得エラー: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('グループ取得に失敗しました:', error);
      throw error;
    }
  }

  // ロール管理
  async getAllRoles(): Promise<IAMRole[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/roles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`ロール取得エラー: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ロール取得に失敗しました:', error);
      throw error;
    }
  }

  // 権限の可視化
  async getUserPermissions(userId: string): Promise<PermissionVisualization> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/users/${userId}/permissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`権限取得エラー: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('権限取得に失敗しました:', error);
      throw error;
    }
  }

  // ポリシーのアタッチ/デタッチ
  async attachPolicyToUser(userId: string, policyArn: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/users/${userId}/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ policyArn })
      });
      
      if (!response.ok) {
        throw new Error(`ポリシーアタッチエラー: ${response.statusText}`);
      }
    } catch (error) {
      console.error('ポリシーアタッチに失敗しました:', error);
      throw error;
    }
  }

  async detachPolicyFromUser(userId: string, policyArn: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/users/${userId}/policies/${encodeURIComponent(policyArn)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`ポリシーデタッチエラー: ${response.statusText}`);
      }
    } catch (error) {
      console.error('ポリシーデタッチに失敗しました:', error);
      throw error;
    }
  }

  // グループへのユーザー追加/削除
  async addUserToGroup(userId: string, groupName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/groups/${groupName}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        throw new Error(`グループ追加エラー: ${response.statusText}`);
      }
    } catch (error) {
      console.error('グループ追加に失敗しました:', error);
      throw error;
    }
  }

  async removeUserFromGroup(userId: string, groupName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/groups/${groupName}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`グループ削除エラー: ${response.statusText}`);
      }
    } catch (error) {
      console.error('グループ削除に失敗しました:', error);
      throw error;
    }
  }

  // セキュリティ分析
  async analyzeUserSecurity(userId: string): Promise<{
    riskLevel: 'Low' | 'Medium' | 'High';
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/users/${userId}/security-analysis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`セキュリティ分析エラー: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('セキュリティ分析に失敗しました:', error);
      throw error;
    }
  }

  // アクセスキー管理
  async getUserAccessKeys(userId: string): Promise<{
    accessKeyId: string;
    status: 'Active' | 'Inactive';
    createDate: string;
    lastUsedDate?: string;
  }[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/users/${userId}/access-keys`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`アクセスキー取得エラー: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('アクセスキー取得に失敗しました:', error);
      throw error;
    }
  }

  async createAccessKey(userId: string): Promise<{
    accessKeyId: string;
    secretAccessKey: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/users/${userId}/access-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`アクセスキー作成エラー: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('アクセスキー作成に失敗しました:', error);
      throw error;
    }
  }

  async deactivateAccessKey(userId: string, accessKeyId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aws-iam/users/${userId}/access-keys/${accessKeyId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`アクセスキー無効化エラー: ${response.statusText}`);
      }
    } catch (error) {
      console.error('アクセスキー無効化に失敗しました:', error);
      throw error;
    }
  }
}

// シングルトンインスタンス
export const awsIamService = new AWSIAMService();

// React Hook for AWS IAM Service
export const useAWSIAMService = () => {
  return {
    service: awsIamService,
    // 便利なヘルパー関数
    formatPermissions: (permissions: PermissionVisualization['permissions']) => {
      return permissions.map(perm => ({
        ...perm,
        displayName: `${perm.service}: ${perm.actions.join(', ')}`
      }));
    },
    
    getRiskColor: (riskLevel: 'Low' | 'Medium' | 'High') => {
      switch (riskLevel) {
        case 'Low': return 'text-green-600';
        case 'Medium': return 'text-yellow-600';
        case 'High': return 'text-red-600';
        default: return 'text-gray-600';
      }
    },
    
    formatDate: (dateString: string) => {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
};

export default awsIamService;