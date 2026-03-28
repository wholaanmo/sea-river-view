Module not found: Can't resolve './globals.css'
./Desktop/SUNSHINE/sea-river-view/app/dashboard/admin/layout.js (7:1)

Module not found: Can't resolve './globals.css'
   5 | import AdminNavbar from '@/components/admin/AdminNavbar';
   6 | import AdminSidebar from '@/components/admin/Sidebar';
>  7 | import './globals.css'
     | ^^^^^^^^^^^^^^^^^^^^^^
   8 |
   9 |
  10 | export default function AdminLayout({ children }) {

Import traces:
  Client Component Browser:
    ./Desktop/SUNSHINE/sea-river-view/app/dashboard/admin/layout.js [Client Component Browser]
    ./Desktop/SUNSHINE/sea-river-view/app/dashboard/admin/layout.js [Server Component]

  Client Component SSR:
    ./Desktop/SUNSHINE/sea-river-view/app/dashboard/admin/layout.js [Client Component SSR]
    ./Desktop/SUNSHINE/sea-river-view/app/dashboard/admin/layout.js [Server Component]

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Google Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
        {/* Material Icons */}
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}