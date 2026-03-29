import { ShieldAlert, Scale, FileText, Gavel, Clock, CreditCard, ChevronRight } from "lucide-react";

export default function TermsPage() {
  const highlights = [
    { title: "As-Is Policy", desc: "All items sold without warranty or guarantee of any kind.", icon: ShieldAlert },
    { title: "Final Sales", desc: "No refunds, exchanges, or returns under any circumstances.", icon: Gavel },
    { title: "Payment", desc: "Cards on file charged immediately after auction close.", icon: CreditCard },
    { title: "Removal", desc: "Forfeiture of items not removed during pickup hours.", icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-secondary italic">
      {/* SaaS Premium Header */}
      <section className="bg-white border-b border-zinc-100 pt-20 pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-[1px] w-6 bg-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">Rules & Protocols</span>
                <div className="h-[1px] w-6 bg-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-secondary leading-none font-display uppercase mb-6">
                Terms of <br/> <span className="text-primary">Service</span>.
            </h1>
            <p className="max-w-xl mx-auto text-zinc-400 text-base md:text-lg font-medium leading-relaxed uppercase">
                Contractual framework for all participants of Virginia Liquidation.
            </p>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                {highlights.map((h, i) => (
                    <div key={i} className="bg-white p-6 rounded-[24px] border border-zinc-100 shadow-sm hover:border-primary/20 transition-all">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                            <h.icon size={20} />
                        </div>
                        <h3 className="text-sm font-bold text-secondary uppercase font-display mb-2">{h.title}</h3>
                        <p className="text-zinc-400 text-[10px] font-medium leading-relaxed uppercase">{h.desc}</p>
                    </div>
                ))}
            </div>

            {/* Official Legal Text Block */}
            {/* Official Legal Text Block */}
            <div className="bg-white p-8 md:p-14 rounded-[32px] border border-zinc-100 shadow-sm text-zinc-500 text-[11px] md:text-sm leading-relaxed uppercase font-medium italic space-y-12">
              
              {/* Introduction */}
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-black text-secondary tracking-tight font-display flex items-center gap-3">
                  End User License Agreement (EULA)
                </h2>
                <div className="h-[1px] w-12 bg-primary/20 mb-6" />
                <p>This End User License Agreement (“Agreement”) governs the use of the website Virginialiquidation.com; any third-party materials made available in connection with it; and any associated media, content, or documentation (collectively, the “Website”).</p>
                <p>This Agreement is entered into by and between VirginiaLiquidation.com, a Cannella Pan Company (“Licensor”), and any individual or entity accessing or using the Website (“User”) (each a “Party” and collectively, the “Parties”).</p>
                <p>By accessing, browsing, or using the Website, the User agrees to be bound by this Agreement. If the User does not agree, the Website must not be used.</p>
              </div>

              {/* Sections */}
              <div className="space-y-10">
                {/* Section 1 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-secondary uppercase flex items-center gap-2"><span className="text-primary">1.</span> Grant of License</h3>
                  <p>Licensor grants the User a limited, non-exclusive, revocable, non-transferable, and non-sublicensable license to access and use the Website for personal or business purposes in accordance with this Agreement.</p>
                </div>

                {/* Section 2 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-secondary uppercase flex items-center gap-2"><span className="text-primary">2.</span> Scope of License</h3>
                  <p>The User may only use the Website as expressly permitted. All rights not granted are reserved.</p>
                  <p className="font-bold text-zinc-700">The User agrees NOT to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-zinc-400">
                    <li>Modify, reverse engineer, decompile, or create derivative works from the Website</li>
                    <li>Remove or alter any copyright, trademark, or proprietary notices</li>
                    <li>Use the Website for unlawful purposes or in violation of applicable laws</li>
                    <li>Interfere with or disrupt the Website or its servers</li>
                    <li>Circumvent security features or access restrictions</li>
                    <li>Provide false, inaccurate, or misleading information</li>
                    <li>Assist or encourage others to engage in prohibited activities</li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-secondary uppercase flex items-center gap-2"><span className="text-primary">3.</span> Ownership Rights</h3>
                  <p>The Website and all associated intellectual property rights are owned exclusively by Licensor. This Agreement does not grant the User any ownership rights.</p>
                </div>

                {/* Section 4 */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-secondary uppercase flex items-center gap-2"><span className="text-primary">4.</span> Disclaimers and Limitation of Liability</h3>
                  
                  <div className="space-y-4 ml-2">
                    <div>
                      <h4 className="font-bold text-zinc-700">A. No Warranty</h4>
                      <p className="text-zinc-400">The Website is provided “as-is” and “as-available” without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, or non-infringement.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-700">B. No Responsibility</h4>
                      <p className="text-zinc-400">Licensor does not guarantee uninterrupted service and is not responsible for errors, omissions, or service interruptions.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-700">C. Limitation of Liability</h4>
                      <p className="text-zinc-400">To the fullest extent permitted by law: Licensor shall not be liable for indirect, incidental, or consequential damages. Total liability shall not exceed the amount paid by the User to Licensor. Some jurisdictions may not allow limitations, so certain provisions may not apply.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-700">D. Third-Party Content</h4>
                      <p className="text-zinc-400">The Website may include third-party content. Licensor is not responsible for its accuracy, legality, or reliability.</p>
                    </div>
                  </div>
                </div>

                {/* Section 5 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-secondary uppercase flex items-center gap-2"><span className="text-primary">5.</span> Indemnification</h3>
                  <p>The User agrees to indemnify and hold harmless Licensor, its affiliates, employees, and agents from any claims, damages, or expenses arising from:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-zinc-400">
                    <li>Use of the Website</li>
                    <li>Violation of this Agreement</li>
                    <li>Violation of applicable laws or third-party rights</li>
                  </ul>
                </div>

                {/* Section 6 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-secondary uppercase flex items-center gap-2"><span className="text-primary">6.</span> Dispute Resolution</h3>
                  <p>This Agreement is governed by the laws of the Commonwealth of Virginia.</p>
                  <p>All disputes shall be resolved exclusively in:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-zinc-400">
                    <li>State courts located in Fairfax County, Virginia, or</li>
                    <li>The U.S. District Court for the Eastern District of Virginia (Alexandria Division)</li>
                  </ul>
                  <p className="mt-4 font-bold text-zinc-700">The Parties:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-zinc-400">
                    <li>Consent to jurisdiction in these courts</li>
                    <li>Waive objections to venue</li>
                    <li>Agree to no jury trial</li>
                    <li>Agree to no class actions</li>
                  </ul>
                  <p className="mt-2">The prevailing party may recover legal fees and costs.</p>
                </div>

                {/* Section 7 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-secondary uppercase flex items-center gap-2"><span className="text-primary">7.</span> Notices</h3>
                  <p>All notices must be in writing and may be delivered via:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-zinc-400">
                    <li>Email</li>
                    <li>Courier</li>
                    <li>Certified or registered mail</li>
                  </ul>
                </div>

                {/* Section 8 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-secondary uppercase flex items-center gap-2"><span className="text-primary">8.</span> Amendments</h3>
                  <p>Licensor may update this Agreement at any time. Updates become effective upon posting. Continued use of the Website constitutes acceptance of changes.</p>
                </div>

                {/* Section 9 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-secondary uppercase flex items-center gap-2"><span className="text-primary">9.</span> Assignment</h3>
                  <p>The User may not assign rights under this Agreement without written consent from Licensor.</p>
                </div>

                {/* Section 10 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-secondary uppercase flex items-center gap-2"><span className="text-primary">10.</span> Waiver</h3>
                  <p>Failure to enforce any provision does not constitute a waiver of that provision or any other rights.</p>
                </div>

                {/* Section 11 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-secondary uppercase flex items-center gap-2"><span className="text-primary">11.</span> Severability & Survival</h3>
                  <p>If any provision is found invalid, the remaining provisions remain enforceable. All provisions intended to survive termination shall remain in effect.</p>
                </div>

                {/* Section 12 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-secondary uppercase flex items-center gap-2"><span className="text-primary">12.</span> Entire Agreement</h3>
                  <p>This Agreement represents the entire understanding between the Parties and supersedes all prior agreements.</p>
                </div>

                {/* Section 13 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-secondary uppercase flex items-center gap-2"><span className="text-primary">13.</span> Additional Assurances</h3>
                  <p>The Parties agree to take reasonable actions necessary to enforce this Agreement.</p>
                </div>

                {/* Section 14 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-secondary uppercase flex items-center gap-2"><span className="text-primary">14.</span> SMS/MMS Terms & Conditions</h3>
                  <p>By providing your phone number, you consent to receive SMS/MMS communications from VirginiaLiquidation.com, a Cannella Pan Company, including:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-zinc-400">
                    <li>Auction reminders</li>
                    <li>Marketing messages</li>
                    <li>Account notifications</li>
                  </ul>
                  <p className="mt-2 text-zinc-400">Message frequency may vary. Message and data rates may apply. You may opt out at any time by replying STOP.</p>
                </div>

              </div>
            </div>
        </div>
      </section>
    </div>
  );
}
