import { useState } from 'react';

import UserTableList from './components/UserTableList';

export default function AdminUserPage() {

  return (
    <div className="space-y-4 ">
     
      {/* <CreateUser onUserCreated={handleUserCreated} /> */}
      <UserTableList />
    </div>
  );
}
