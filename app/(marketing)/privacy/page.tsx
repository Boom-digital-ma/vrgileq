import { Lock, Eye, Database, UserCheck, ShieldCheck, FileText, Globe2, Mail, Phone, MapPin } from "lucide-react";

export default function PrivacyPage() {
  const principles = [
    { title: "Data Security", icon: Lock, desc: "Technical, administrative, and physical safeguards designed to protect Personal Data." },
    { title: "Transparency", icon: Eye, desc: "Clear disclosure of all data collected during registration and bidding phases." },
    { title: "Compliance", icon: ShieldCheck, desc: "Adherence to VCDPA (Virginia), GDPR (EEA/UK), and CCPA/CPRA (California) standards." },
    { title: "User Rights", icon: UserCheck, desc: "Rights to access, correction, deletion, and portability of your personal information." }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-secondary italic">
      {/* SaaS Premium Header */}
      <section className="bg-white border-b border-zinc-100 pt-20 pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-[1px] w-6 bg-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">Legal Framework</span>
                <div className="h-[1px] w-6 bg-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-secondary leading-none font-display uppercase mb-6">
                Privacy <br/> <span className="text-primary">Policy</span>.
            </h1>
            <p className="max-w-xl mx-auto text-zinc-400 text-base md:text-lg font-medium leading-relaxed uppercase">
                Effective date: April 11, 2024. Operated by Cannella Pan LLC.
            </p>
        </div>
      </section>

      {/* Principles Grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                {principles.map((p, i) => (
                    <div key={i} className="bg-white p-6 rounded-[24px] border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-secondary/5 transition-all">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                            <p.icon size={20} />
                        </div>
                        <h3 className="text-sm font-bold text-secondary uppercase font-display mb-2">{p.title}</h3>
                        <p className="text-zinc-400 text-[10px] font-medium leading-relaxed uppercase">{p.desc}</p>
                    </div>
                ))}
            </div>

            {/* Comprehensive Legal Text */}
            <div className="bg-white p-8 md:p-14 rounded-[32px] border border-zinc-100 shadow-sm space-y-12 italic text-zinc-500 text-[11px] leading-relaxed uppercase font-medium">
                
                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">Privacy Policy</h2>
                    <p>Effective date: April 11, 2024</p>
                    <p>Virginialiquidation.com (“Virginialiquidation.com”, “we”, “us”, or “our”) is operated by Cannella Pan LLC (“Cannella Pan”). This Privacy Policy describes how we collect, use, disclose, and protect information about you when you use our website at www.virginialiquidation.com (the “Service”).</p>
                    <p>By accessing or using the Service, you acknowledge that you have read and understood this Privacy Policy. If you do not agree, please do not use the Service.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">1. Definitions</h2>
                    <p>Service means the website www.virginialiquidation.com and any related online services operated by Cannella Pan LLC.</p>
                    <p>Personal Data means information relating to an identified or identifiable natural person (for example, a name, email address, or other identifier).</p>
                    <p>Usage Data means information collected automatically through the Service, such as IP address, browser type, and pages visited.</p>
                    <p>Cookies means small text files placed on your device to store information and recognize your browser.</p>
                    <p>Data Controller means the person or entity that determines the purposes and means of processing Personal Data. For the purposes of this Privacy Policy, Cannella Pan LLC is the Data Controller of your Personal Data.</p>
                    <p>Data Processor or Service Provider means any person or entity that processes Personal Data on behalf of the Data Controller.</p>
                    <p>Data Subject or User means any individual using the Service and whose Personal Data is processed.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">2. Information We Collect</h2>
                    <div className="space-y-4">
                        <h3 className="text-primary font-bold">2.1 Personal Data</h3>
                        <p>We may collect the following categories of Personal Data when you use the Service, register an account, place bids, purchase goods, or contact us:</p>
                        <p>First and last name</p>
                        <p>Email address</p>
                        <p>Telephone number</p>
                        <p>Billing and shipping address (including city, state, postal code, and country)</p>
                        <p>Account credentials (such as username and password)</p>
                        <p>Payment-related information (processed by third-party payment processors)</p>
                        <p>Any other information you choose to provide to us in forms, emails, or communications</p>
                        <p>We ask you not to provide sensitive Personal Data (such as social security numbers, financial account login credentials, medical information, or information relating to racial or ethnic origin, political opinions, or religious beliefs) unless strictly necessary and requested.</p>

                        <h3 className="text-primary font-bold mt-8">2.2 Usage Data</h3>
                        <p>When you access the Service, we may automatically collect certain Usage Data, including:</p>
                        <p>Internet Protocol (IP) address</p>
                        <p>Browser type and version</p>
                        <p>Device type and operating system</p>
                        <p>Referring pages and exit pages</p>
                        <p>Pages and items viewed on the Service</p>
                        <p>Dates and times of visits, and time spent on pages</p>
                        <p>Unique device identifiers and other diagnostic data</p>

                        <h3 className="text-primary font-bold mt-8">2.3 Location Data</h3>
                        <p>With your consent, we may collect and process approximate or precise location information derived from your device or IP address in order to display relevant sales, auctions, or services in your area. You can control collection of location data through your device or browser settings, but some features may not function properly without it.</p>

                        <h3 className="text-primary font-bold mt-8">2.4 Cookies and Similar Technologies</h3>
                        <p>We use Cookies and similar tracking technologies (such as pixels, tags, and scripts) to: Operate and secure the Service, Remember your preferences and settings, Analyze how the Service is used, Support advertising and marketing efforts.</p>
                        <p>You can instruct your browser to refuse Cookies or to indicate when a Cookie is being sent. If you disable Cookies, some portions of the Service may not function properly.</p>
                        <p>Types of Cookies we use include: Session Cookies (needed to operate the Service and manage sessions), Preference Cookies (remembering settings such as language and region), Security Cookies (helping detect and prevent security incidents), Analytics/Advertising Cookies (measuring use of the Service and supporting advertising or remarketing, where applicable).</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">3. How We Use Your Information</h2>
                    <div className="space-y-4">
                        <p>We use Personal Data and Usage Data for the following purposes:</p>
                        <p><strong>Providing the Service:</strong> To create and manage your account, To enable bidding, purchasing, payment, and order fulfillment, To administer auctions, sales, and related activities.</p>
                        <p><strong>Customer Service and Communications:</strong> To respond to inquiries and provide customer support, To send you confirmations, invoices, technical notices, security alerts, and administrative messages.</p>
                        <p><strong>Improving and Securing the Service:</strong> To monitor and analyze usage and performance, To develop new features, services, and offerings, To detect, prevent, and address fraud, abuse, and technical issues.</p>
                        <p><strong>Marketing and Promotions:</strong> To send you newsletters, promotional materials, and information about auctions, sales, and services that may be of interest to you. You may opt out of marketing emails at any time by using the unsubscribe link in our emails or contacting us.</p>
                        <p><strong>Legal and Compliance:</strong> To comply with applicable laws, regulations, and legal processes, To enforce our Terms and Conditions, protect our rights, property, and safety, and that of users or others.</p>
                        <p>We will only process your Personal Data where we have a lawful basis to do so, which may include your consent, performance of a contract with you, our legitimate interests (such as operating and improving the Service), and compliance with legal obligations.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">4. Legal Bases for Processing (EEA/UK Users)</h2>
                    <p>If you are located in the European Economic Area (EEA) or the United Kingdom, our legal bases for processing your Personal Data may include: Consent, Contract, Legitimate Interests, Legal Obligation, and Payment Processing.</p>
                    <p>You are not required to provide Personal Data that is unrelated to the functionality of the Service. However, if you choose not to provide certain information, we may be unable to provide some features or services.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">5. Data Retention</h2>
                    <p>We retain Personal Data only for as long as reasonably necessary to: Provide the Service and complete the transactions you request, Comply with legal, accounting, and reporting obligations, Resolve disputes and enforce our agreements.</p>
                    <p>Usage Data is generally retained for a shorter period unless needed for security, fraud prevention, or legal compliance. When Personal Data is no longer necessary, we will delete or anonymize it, subject to applicable law and our internal policies.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">6. International Transfers of Data</h2>
                    <p>Our Service is operated in the United States. If you access the Service from outside the United States, your information may be transferred to, stored, and processed in the United States or other jurisdictions where data protection laws may differ from those in your location.</p>
                    <p>By using the Service and providing information to us, you consent to the transfer of your Personal Data to the United States and to other countries where we or our Service Providers operate, subject to appropriate safeguards required by applicable law.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">7. Disclosure of Personal Data</h2>
                    <p>We may disclose Personal Data in the following circumstances: Service Providers, Business Transfers, Legal and Compliance, and With Your Consent.</p>
                    <p>We do not sell Personal Data in the sense of “sale” under the California Consumer Privacy Act (CCPA) and similar laws. If this changes, we will update this Privacy Policy and provide the required opt-out mechanisms.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">8. Security of Your Information</h2>
                    <p>We implement commercially reasonable technical, administrative, and physical safeguards designed to protect Personal Data from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the Internet or method of electronic storage is completely secure, and we cannot guarantee absolute security.</p>
                    <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">9. “Do Not Track” Signals (CalOPPA)</h2>
                    <p>Some web browsers incorporate a “Do Not Track” feature that signals websites you visit that you do not want your online activity tracked. At this time, we do not respond to “Do Not Track” signals. You may manage your tracking preferences through your browser and Cookie settings.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">10. Your Privacy Rights</h2>
                    <div className="space-y-4">
                        <p><strong>10.1 Rights of EEA/UK Residents (GDPR):</strong> If you are in the EEA or UK, you may have the right to Access, Rectification, Erasure, Restriction, Portability, Objection, and Withdraw Consent.</p>
                        <p><strong>10.2 Rights of Virginia Residents (VCDPA):</strong> If you are a Virginia resident, the VCDPA may grant you the right to Confirm processing, Correct inaccuracies, Delete Personal Data, Obtain a copy, and Opt out of targeted advertising.</p>
                        <p><strong>10.3 Rights of California Residents (CCPA/CPRA):</strong> If you are a California resident, you may have the right to Know, Delete, Correct, Non-Discrimination, and Opt Out.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">11. Email Communications and CAN-SPAM</h2>
                    <p>We may use your email address to send you information relating to your account, transactions, and the Service, as well as promotional communications about auctions, events, and offers.</p>
                    <p>To comply with applicable email marketing laws (such as the CAN-SPAM Act), we do not use false or misleading header or subject information, identify commercial messages as advertisements where required, include a valid physical postal address in our emails, provide a clear and conspicuous way to opt out of receiving marketing emails, and honor opt-out requests within a reasonable period of time.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">12. Children’s Privacy</h2>
                    <p>The Service is not directed to, and we do not knowingly collect Personal Data from, individuals under 18 years of age. If we become aware that we have collected Personal Data from anyone under 18 without verifiable parental consent, we will take reasonable steps to delete that information.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">13. Third-Party Links and Services</h2>
                    <p>The Service may contain links to third-party websites, applications, or services that we do not operate or control. This Privacy Policy does not apply to those third parties, and we are not responsible for their content, policies, or practices.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">14. Payment Processing</h2>
                    <p>We may offer paid products or services through the Service. In such cases, we use third-party payment processors (such as Authorize.net) to process payments securely.</p>
                    <p>We do not store or collect your full payment card details. That information is provided directly to our payment processors, whose use of your Personal Data is governed by their own privacy policies and industry standards.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">15. Changes to This Privacy Policy</h2>
                    <p>We may update or modify this Privacy Policy from time to time. When we do, we will post the updated policy on this page and revise the “Effective date” at the top. In some cases, we may provide additional notice (such as by email or by posting a prominent notice on the Service), where required by law.</p>
                    <p>Your continued use of the Service after the effective date of any changes constitutes your acceptance of the revised Privacy Policy. We encourage you to review this Privacy Policy periodically.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-secondary border-b border-zinc-50 pb-4 uppercase">16. Contact Us</h2>
                    <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-[10px]">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <MapPin size={14} /> OFFICE
                            </div>
                            <p>Cannella Pan LLC<br/>Attn: Privacy Officer<br/>6415 Virginia Mannor Rd<br/>Beltsville MD</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <Mail size={14} /> DIGITAL
                            </div>
                            <p>wb@cannellapan.com</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <Phone size={14} /> SUPPORT
                            </div>
                            <p>6142054356</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
