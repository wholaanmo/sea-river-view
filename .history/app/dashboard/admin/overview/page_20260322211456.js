'app/dashboard/admin/overview/page.js'
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

useEffect(() => {
  if (auth.currentUser) {
    console.log("UID:", auth.currentUser.uid);
  } else {
    console.log("No user logged in");
  }
}, []);