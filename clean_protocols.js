const fs = require('fs');
const path = require('path');

const replacements = [
  { file: 'app/admin/help/page.tsx', search: 'Administrative Protocol & Operating Guide', replace: 'Administrative & Operating Guide' },
  { file: 'app/admin/help/page.tsx', search: 'require protocol clarification', replace: 'require process clarification' },
  { file: 'app/(logistics)/gate-pass/[id]/verify/page.tsx', search: 'Security Verification Protocol', replace: 'Security Verification' },
  { file: 'app/(marketing)/pickup-information/page.tsx', search: 'collection protocol', replace: 'collection process' },
  { file: 'app/(marketing)/pickup-information/page.tsx', search: 'The Collection Protocol', replace: 'The Collection Process' },
  { file: 'app/(marketing)/pickup-information/page.tsx', search: 'PROTOCOL 0{i+1}', replace: 'STEP 0{i+1}' },
  { file: 'app/(marketing)/auth/signup/page.tsx', search: 'Stripe Financial Protocol', replace: 'Stripe Payment System' },
  { file: 'app/(marketing)/auth/forgot-password/page.tsx', search: 'Initiate Security Protocol', replace: 'Initiate Password Reset' },
  { file: 'app/(marketing)/how-it-works/page.tsx', search: 'Real-Time Bidding Protocol', replace: 'Real-Time Bidding System' },
  { file: 'app/(marketing)/profile/ClientProfile.tsx', search: 'Password Protocol', replace: 'Password Requirements' },
  { file: 'app/(marketing)/events/[id]/page.tsx', search: 'Official Protocol', replace: 'Official Rules' },
  { file: 'app/(marketing)/events/[id]/page.tsx', search: 'PROTOCOL CARDS GRID', replace: 'RULES CARDS GRID' },
  { file: 'app/(marketing)/events/[id]/page.tsx', search: 'Assets currently in protocol', replace: 'Assets currently active' },
  { file: 'app/(marketing)/buyers/page.tsx', search: 'Protocol & Guidelines', replace: 'Rules & Guidelines' },
  { file: 'app/(marketing)/page.tsx', search: 'matching your protocol', replace: 'matching your criteria' },
  { file: 'app/(marketing)/page.tsx', search: 'in this protocol window', replace: 'currently active' },
  { file: 'app/(marketing)/page.tsx', search: 'matching this protocol window', replace: 'matching this timeframe' },
  { file: 'app/(marketing)/page.tsx', search: 'Reset Protocol', replace: 'Reset Filters' },
  { file: 'app/(marketing)/sellers/page.tsx', search: 'professional protocol', replace: 'professional process' },
  { file: 'app/(marketing)/sellers/page.tsx', search: '12-Step Protocol Grid', replace: '12-Step Process Grid' },
  { file: 'app/(marketing)/sellers/page.tsx', search: '12-Step Protocol', replace: '12-Step Process' },
  { file: 'components/auction/ProtocolCards.tsx', search: 'protocol-event-', replace: 'rules-event-' },
  { file: 'components/auction/ProtocolCards.tsx', search: 'Protocols locked', replace: 'Bidding locked' },
  { file: 'components/auction/ProtocolCards.tsx', search: 'bidding protocol capacity', replace: 'bidding capacity' },
  { file: 'components/auction/ProtocolCards.tsx', search: 'Status Protocol', replace: 'Event Status' },
  { file: 'components/auction/PickupScheduler.tsx', search: 'Removal Protocol', replace: 'Removal Process' },
  { file: 'components/auction/QuickViewModal.tsx', search: 'Initiate Bidding Protocol', replace: 'Place a Bid' },
  { file: 'components/auction/AuctionDetailsRealtime.tsx', search: 'Removal Protocol', replace: 'Removal Process' },
  { file: 'components/auction/AuctionDetailsRealtime.tsx', search: 'Security protocol active', replace: 'Secure payment active' },
  { file: 'components/auction/RegistrationButton.tsx', search: 'Protocol Access Only', replace: 'Registration Required' },
  { file: 'components/auction/RegistrationButton.tsx', search: 'Financial Protocol', replace: 'Payment Setup' },
  { file: 'components/auth/CardValidation.tsx', search: 'Payment Protocol', replace: 'Payment Verification' },
  { file: 'components/auth/CardValidation.tsx', search: 'executing this protocol', replace: 'verifying your card' },
  { file: 'components/layout/Footer.tsx', search: 'Privacy Protocol', replace: 'Privacy Policy' },
  { file: 'components/layout/Header.tsx', search: 'System Protocol Update', replace: 'System Update' },
  { file: 'components/layout/Header.tsx', search: 'System Protocol', replace: 'System Notification' },
  { file: 'components/layout/Header.tsx', search: 'Acknowledge Protocol', replace: 'Acknowledge' },
  { file: 'components/admin/AuctionEdit.tsx', search: 'Locked Asset Protocol', replace: 'Locked Asset' },
  { file: 'components/admin/EventShow.tsx', search: 'Logistics Protocol', replace: 'Logistics' },
  { file: 'components/admin/EventShow.tsx', search: 'SETTLEMENT PROTOCOL HUB', replace: 'SETTLEMENT HUB' },
  { file: 'components/admin/AdminSider.tsx', search: 'Verifying Protocol', replace: 'Verifying Auth' },
  { file: 'components/admin/UserList.tsx', search: 'Identity Protocol', replace: 'Identity Status' },
  { file: 'components/admin/AdvancedInventoryLoader.tsx', search: 'Syncing Protocol', replace: 'Syncing Data' },
  { file: 'components/admin/AdvancedInventoryLoader.tsx', search: 'Execute Sync Protocol', replace: 'Execute Sync' },
  { file: 'components/admin/AdvancedInventoryLoader.tsx', search: 'Auto-Matching Protocol Active', replace: 'Auto-Matching Active' },
  { file: 'components/admin/AdvancedInventoryLoader.tsx', search: 'Safety Protocol', replace: 'Safety Check' },
  { file: 'components/admin/UserShow.tsx', search: 'Email Protocol', replace: 'Email Status' }
];

for (const r of replacements) {
    const filePath = path.join('/Users/nabil/Documents/Sites/virginia', r.file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(r.search, r.replace);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${r.file}: ${r.search} -> ${r.replace}`);
    } else {
        console.log(`File not found: ${r.file}`);
    }
}
