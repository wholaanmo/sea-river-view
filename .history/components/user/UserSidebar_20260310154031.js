'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function Sidebar({ isOpen, onToggle }) {
  const [is_expanded, setIsExpanded] = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsExpanded(isOpen)
  }, [isOpen])

  const handleSignOut = () => {
    setShowSignOutModal(true)
  }

  const confirmSignOut = async () => {
    try {
      console.log('Signing out...')
      // Use NextAuth's signOut function to properly clear the session
      await signOut({ 
        redirect: false,
        callbackUrl: '/login'
      })
      setShowSignOutModal(false)
      // Force a hard redirect to ensure session is cleared
      window.location.href = '/login'
    } catch (error) {
      console.error('Sign out error:', error)
      // Fallback redirect
      window.location.href = '/login'
    }
  }

  const cancelSignOut = () => {
    setShowSignOutModal(false)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[rgba(211,211,211,0.5)] backdrop-blur-[1px] z-40 lg:hidden"
          onClick={() => onToggle(false)}
        />
      )}
      
      <aside className={`
        flex flex-col items-center font-['Inter'] 
        min-h-[calc(100vh-60px)] overflow-hidden p-4 
        bg-[#728a9c] text-[#121731] transition-all duration-300 ease-in-out 
        fixed left-0 top-[60px] z-50
        ${is_expanded ? 'w-[230px] items-start' : 'w-[calc(2.5rem+32px)] items-center'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Menu Items */}
        <div className={`
          menu w-full m-0 flex flex-col flex-1
          ${is_expanded ? 'items-stretch' : 'items-center'}
        `}>
          <Link href="/user/dashboard" className={`
            group button flex items-center no-underline p-4 
            transition-all duration-200 ease-out rounded-lg mb-2
            hover:bg-white
            ${is_expanded ? 'justify-start' : 'justify-center w-full'}
          `}>
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#728a9c]">dashboard</span>
            <span className={`
              text-white transition-all duration-200 ease-out
              group-hover:text-[#728a9c]
              ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
            `}>Dashboard</span>
          </Link>

          <Link href="/user/request" className={`
            group button flex items-center no-underline p-4 
            transition-all duration-200 ease-out rounded-lg mb-2
            hover:bg-white
            ${is_expanded ? 'justify-start' : 'justify-center w-full'}
          `}>
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#728a9c]">assignment</span>
            <span className={`
              text-white transition-all duration-200 ease-out
              group-hover:text-[#728a9c]
              ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
            `}>Requests</span>
          </Link>

          <Link href="/user/offer" className={`
            group button flex items-center no-underline p-4 
            transition-all duration-200 ease-out rounded-lg mb-2
            hover:bg-white
            ${is_expanded ? 'justify-start' : 'justify-center w-full'}
          `}>
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#728a9c]">front_hand</span>
            <span className={`
              text-white transition-all duration-200 ease-out
              group-hover:text-[#728a9c]
              ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
            `}>Offers</span>
          </Link>

          <Link href="/user/message" className={`
            group button flex items-center no-underline p-4 
            transition-all duration-200 ease-out rounded-lg mb-2
            hover:bg-white
            ${is_expanded ? 'justify-start' : 'justify-center w-full'}
          `}>
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#728a9c]">chat</span>
            <span className={`
              text-white transition-all duration-200 ease-out
              group-hover:text-[#728a9c]
              ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
            `}>Messages</span>
          </Link>

          <Link href="/user/account" className={`
            group button flex items-center no-underline p-4 
            transition-all duration-200 ease-out rounded-lg mb-2
            hover:bg-white
            ${is_expanded ? 'justify-start' : 'justify-center w-full'}
          `}>
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#728a9c]">account_circle</span>
            <span className={`
              text-white transition-all duration-200 ease-out
              group-hover:text-[#728a9c]
              ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
            `}>My Account</span>
          </Link>
        </div>

        {/* Sign Out Button */}
        <div className="menu-bottom flex justify-center w-full mt-auto pt-4 border-t border-[#121731]">
          <button onClick={handleSignOut} className={`
            group sign-out flex items-center no-underline p-4 
            transition-all duration-200 ease-out rounded-lg
            hover:bg-white bg-none border-none cursor-pointer
            ${is_expanded ? 'justify-start w-full' : 'justify-center w-full'}
          `}>
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#728a9c]">logout</span>
            <span className={`
              text-white transition-all duration-200 ease-out text-lg
              group-hover:text-[#728a9c]
              ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
            `}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div 
          className="fixed inset-0 bg-[rgba(211,211,211,0.5)] backdrop-blur-[1px] flex justify-center items-center z-50 p-4"
          onClick={cancelSignOut}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <span className="material-icons text-4xl text-red-600 mb-3">warning</span>
              <h3 className="text-xl font-semibold text-[#121731] mb-2">Confirm Sign Out</h3>
              <p className="text-[#728a9c]">Are you sure you want to sign out?</p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelSignOut}
                className="px-6 py-2 border border-[#728a9c] text-[#728a9c] rounded-lg hover:bg-[#b7c8d4] hover:text-white transition-colors duration-300"
              >
                Cancel
              </button>

              <button
                onClick={confirmSignOut}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
              >
                Sign Out
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}