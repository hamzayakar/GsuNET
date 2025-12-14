# TASK: Admin Management Sistemi

**Öncelik**: Yüksek
**Tahmini Süre**: 3-4 saat
**Zorluk**: Orta
**Tarih**: 2025-12-14

---

## 📋 GENEL BAKIŞ

Admin kullanıcılarının sistemi yönetebilmesi için User Management özelliklerinin eklenmesi gerekiyor.

**Hedef**:
- Admin'ler tüm kullanıcıları listeleyebilmeli
- Kullanıcıların rollerini değiştirebilmeli
- Kullanıcıları silebilmeli (soft delete veya hard delete)
- Kullanıcı detaylarını görüntüleyebilmeli

---

## 🎯 BACKEND GÖREVLERİ

### 1. Schema Oluşturma
**Dosya**: `backend/app/schemas/user.py`

**Eklenecek Schema'lar**:
```python
# UserUpdate - Admin'in kullanıcıyı güncellemesi için
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    student_number: Optional[str] = None
    department: Optional[str] = None
    role: Optional[UserRole] = None

    class Config:
        from_attributes = True

# UserListResponse - Liste endpoint'i için
class UserListResponse(BaseModel):
    id: int
    email: str
    full_name: str
    student_number: Optional[str]
    department: Optional[str]
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True
```

**Not**: Mevcut `UserResponse` zaten var, gerekirse kullanabilirsiniz.

---

### 2. Route Dosyası Oluşturma
**Dosya**: `backend/app/routes/users.py` (YENİ DOSYA)

**Oluşturulacak Endpoint'ler**:

#### GET /users - Kullanıcı Listesi (Admin Only)
```python
@router.get("/users", response_model=List[UserListResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all users (admin only)

    Query Parameters:
    - skip: Pagination offset
    - limit: Max results (default 100)
    - role: Filter by role (optional)

    Authorization: Admin only
    """
    query = db.query(User)

    if role:
        query = query.filter(User.role == role)

    users = query.offset(skip).limit(limit).all()
    return users
```

#### GET /users/{user_id} - Kullanıcı Detayı (Admin Only)
```python
@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get user details by ID (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user
```

#### PUT /users/{user_id} - Kullanıcı Güncelleme (Admin Only)
```python
@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update user details (admin only)

    Can update:
    - full_name
    - student_number
    - department
    - role (promote/demote users)

    Authorization: Admin only
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent admin from demoting themselves
    if user_id == current_user.id and user_update.role and user_update.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own admin role"
        )

    # Update fields
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    return user
```

#### DELETE /users/{user_id} - Kullanıcı Silme (Admin Only)
```python
@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete user (admin only)

    WARNING: This will CASCADE delete:
    - User's event registrations
    - User's notifications
    - User's follow relationships

    Authorization: Admin only
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent admin from deleting themselves
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account"
        )

    db.delete(user)
    db.commit()

    return None
```

---

### 3. Dependencies Güncelleme
**Dosya**: `backend/app/core/dependencies.py`

**Eklenecek Dependency**:
```python
def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Require admin role

    Raises:
        HTTPException: If user is not admin
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
```

**Not**: Benzer `require_advisor_or_admin` dependency'si var mı kontrol edin, yoksa onu da ekleyin.

---

### 4. Router Kaydı
**Dosya**: `backend/app/main.py`

**Eklenecek Satır**:
```python
from app.routes import auth, events, registrations, clubs, rooms, notifications, users

# Router'ları kaydet
app.include_router(users.router, prefix=settings.API_V1_STR)
```

---

## 🎨 FRONTEND GÖREVLERİ

### 1. API Servis Fonksiyonları
**Dosya**: `frontend/src/services/api.js`

**Eklenecek API'ler**:
```javascript
// User Management API
export const usersAPI = {
  // Get all users (admin only)
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/users?${queryParams}`);
    return response.data;
  },

  // Get user by ID (admin only)
  getById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Update user (admin only)
  update: async (id, data) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user (admin only)
  delete: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};
```

---

### 2. Admin Panel Sayfası
**Dosya**: `frontend/src/pages/AdminPanel.jsx` (YENİ DOSYA)

**Temel Yapı**:
```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersAPI.update(userId, { role: newRole });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  // TODO: Implement UI
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          User Management
        </h1>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.id === user.id}
                      >
                        <option value="student">Student</option>
                        <option value="club_manager">Club Manager</option>
                        <option value="advisor">Advisor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{u.department}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user.id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
```

**Tasarım Önerileri**:
- Mevcut projenin stil yapısını kullanın (Tailwind CSS)
- Galatasaray renkleri: `#a90432` (kırmızı), `#fbc02d` (sarı)
- Responsive tasarım (mobile-first)
- Loading state'leri ekleyin
- Confirmation modal'ları ekleyin (delete için)

---

### 3. Route Ekleme
**Dosya**: `frontend/src/App.jsx`

**Eklenecek Route**:
```jsx
import AdminPanel from './pages/AdminPanel';

// ...

<Route
  path="/admin"
  element={
    <ProtectedRoute roles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

---

### 4. Navbar'a Link Ekleme
**Dosya**: `frontend/src/components/Navbar.jsx`

**Eklenecek Link** (sadece admin için göster):
```jsx
{user && user.role === 'admin' && (
  <Link to="/admin" className="...">
    {t('adminPanel') || 'Admin Panel'}
  </Link>
)}
```

---

## 📝 KONTROL LİSTESİ

### Backend
- [ ] `backend/app/schemas/user.py` - UserUpdate ve UserListResponse schema'larını ekle
- [ ] `backend/app/routes/users.py` - Yeni dosya oluştur
- [ ] GET `/users` endpoint'i - Admin only
- [ ] GET `/users/{id}` endpoint'i - Admin only
- [ ] PUT `/users/{id}` endpoint'i - Admin only
- [ ] DELETE `/users/{id}` endpoint'i - Admin only
- [ ] `backend/app/core/dependencies.py` - `require_admin` dependency ekle
- [ ] `backend/app/main.py` - users router'ı kaydet
- [ ] Backend'i test et (Postman/Swagger)

### Frontend
- [ ] `frontend/src/services/api.js` - usersAPI ekle
- [ ] `frontend/src/pages/AdminPanel.jsx` - Yeni sayfa oluştur
- [ ] User listesi tablosu
- [ ] Role dropdown (change role)
- [ ] Delete button + confirmation
- [ ] `frontend/src/App.jsx` - /admin route ekle
- [ ] `frontend/src/components/Navbar.jsx` - Admin link ekle (sadece admin için)
- [ ] Responsive tasarım kontrol et
- [ ] Toast notification'lar ekle
- [ ] Frontend'i test et

---

## 🧪 TEST SENARYOLARI

### Backend Test
1. Admin kullanıcısı ile login yap
2. GET /users - Tüm kullanıcıları al
3. GET /users/{id} - Belirli kullanıcıyı al
4. PUT /users/{id} - Kullanıcının rolünü değiştir (student → club_manager)
5. DELETE /users/{id} - Kullanıcıyı sil
6. Non-admin kullanıcısı ile GET /users - 403 Forbidden almalı

### Frontend Test
1. Admin ile login yap
2. /admin sayfasına git
3. Kullanıcı listesini görüntüle
4. Bir kullanıcının rolünü değiştir → Toast görmeli
5. Bir kullanıcıyı sil (confirm sonrası) → Toast görmeli
6. Non-admin kullanıcısı ile /admin'e erişmeye çalış → Redirect olmalı

---

## ⚠️ DİKKAT EDİLMESİ GEREKENLER

1. **Kendini Silme**: Admin kendi hesabını silemez
2. **Kendini Demote Etme**: Admin kendi rolünü değiştiremez
3. **Cascade Delete**: User silinince:
   - Event registrations CASCADE delete
   - Notifications CASCADE delete
   - Follow relationships CASCADE delete
   - Managed clubs → manager_id SET NULL (otomatik)
4. **Authorization**: Tüm endpoint'ler admin only olmalı
5. **Confirmation**: Delete işlemi için mutlaka confirmation modal
6. **Toast Feedback**: Her işlem sonrası kullanıcıya feedback

---

## 💡 BONUS ÖZELLİKLER (Opsiyonel)

1. **Search/Filter**: Kullanıcıları email veya isme göre arama
2. **Pagination**: Çok kullanıcı varsa pagination ekle
3. **Sort**: Tablodaki sütunlara göre sıralama
4. **Bulk Actions**: Birden fazla kullanıcıyı seç ve toplu işlem
5. **User Details Modal**: Kullanıcı detaylarını modal'da göster
6. **Activity Log**: Admin işlemlerini loglama

---

**Başarılar!** Sorularınız olursa Claude'a sorun.

**Tahmini Tamamlanma**: 3-4 saat (deneyimli geliştirici için)
