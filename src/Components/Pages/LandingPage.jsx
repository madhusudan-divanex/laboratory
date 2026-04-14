// import React from "react";
// import { motion } from "framer-motion";
// import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import "../../assets/css/landing.css"

import {
  Shield,
  Sparkles,
  ClipboardList,
  TestTube2,
  Barcode,
  Activity,
  Brain,
  FileSignature,
  Users,
  Network,
  BarChart3,
  Cloud,
  Lock,
  ArrowRight,
  Check,
} from "lucide-react";
import { getApiData } from "../../services/api";
import base_url from "../../../baseUrl";
import ContactQuery from "./ContactQuery";



export default function LandingPage() {
  const year = new Date().getFullYear();
  const [firstSection, setFirstSection] = useState()
  const [secondSection, setSecondSection] = useState()
  const [thirdSection, setThirdSection] = useState()
  const [fourthSection, setFourthSection] = useState()
  const [fivethSection, setFivethSection] = useState()
  const [sixSection, setSixSection] = useState()
  const [sevenSection, setSevenSection] = useState()
  const fetchData = async () => {
    try {
      const res = await getApiData("api/admin/landing/lab");
      if(res.success){
        setFirstSection(res?.data?.firstSection);
        setSecondSection(res?.data?.secondSection)
        setThirdSection(res?.data?.thirdSection)
        setFourthSection(res?.data?.fourthSection)
        setFivethSection(res?.data?.fivethSection)
        setSixSection(res?.data?.sixSection)
        setSevenSection(res?.data?.sevenSection)
      }


    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="neo-lab-wrapper">

      {/* <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-gray-200 bg-gray-50">
              <TestTube2 className="h-5 w-5 text-gray-700" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">NeoHealthCard</div>
              <div className="text-xs text-gray-500">Laboratory</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
            <a className="hover:text-gray-900" href="#capabilities">Capabilities</a>
            <a className="hover:text-gray-900" href="#security">Security</a>
            <a className="hover:text-gray-900" href="#roles">Roles</a>
            <a className="hover:text-gray-900" href="#connectivity">Connectivity</a>
            <a className="hover:text-gray-900" href="#analytics">Analytics</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-2xl" asChild>
              <a href="#contact">Integrate</a>
            </Button>
            <Button className="rounded-2xl" asChild>
              <a href="#contact">Request Demo <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
          </div>
        </div>
      </header> */}
      

      <main>

        {/* <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              variants={fadeUp}
            >
              <div className="flex flex-wrap gap-2">
                <Pill><Shield className="mr-2 h-3.5 w-3.5" /> Secure by Design</Pill>
                <Pill><ClipboardList className="mr-2 h-3.5 w-3.5" /> WHO & ABDM-Aligned</Pill>
                <Pill><Network className="mr-2 h-3.5 w-3.5" /> HL7 / FHIR Ready</Pill>
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
                Precision Diagnostics.
                <span className="block text-gray-600">Intelligent Infrastructure.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm text-gray-600 sm:text-base">
                End-to-end laboratory workflow, real-time patient sync, AI-assisted validation, compliance-grade audit trails, and global interoperability — all connected to a lifetime NeoHealthCard ID.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Sample → Report workflow" value="End-to-end" />
                <Stat label="Audit trails" value="Tamper-evident" />
                <Stat label="Interoperability" value="Standards-first" />
                <Stat label="Delivery" value="Doctor + Patient" />
              </div>
            </motion.div>

            <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="text-sm font-semibold text-gray-900">Live Workflow Snapshot</div>
                <div className="mt-4 space-y-3">
                  {[
                    "Doctor e-order synced",
                    "QR/Barcode chain-of-custody",
                    "HL7 instrument import",
                    "NeoAI-assisted review",
                    "Digitally signed report delivery",
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section> */}

        <section className="neo-lab-hero">
          <div className="container">

            <div className="row align-items-center">

              {/* Left Content */}
              <div className="col-lg-8">

                <div className="neo-pill-wrap">
                  {firstSection?.topShot?.map((item,key)=>
                  <span className="neo-pill" key={key}> {item}</span>)}
                  {/* <span className="neo-pill"> WHO & ABDM-Aligned</span>
                  <span className="neo-pill"> HL7 / FHIR Ready</span> */}
                </div>

                <h1 className="neo-hero-title heading-grad">
                  {firstSection?.firstTitle}
                  <span>{firstSection?.secondTitle || 'Intelligent Infrastructure.'}</span>
                </h1>

                <p className="neo-hero-desc">
                  {firstSection?.description || `End-to-end laboratory workflow, real-time patient sync, AI-assisted validation, <br />
                  compliance-grade audit trails, and global interoperability — all connected
                  to a lifetime NeoHealthCard ID.`}
                </p>

                <div className="row g-2 neo-stat-grid">

                  {firstSection?.bottomShot?.map((item,key)=>
                  <div className="col-6 col-md-3" key={key}>
                    <div className="neo-stat">
                      <div className="neo-stat-value">{item?.label}</div>
                      <div className="neo-stat-label">{item?.value}</div>
                    </div>
                  </div>)}

                  

                </div>

              </div>

              {/* Right Card */}
              <div className="col-lg-4">
                <div className="neo-live-card">

                  <div className="neo-live-title">
                    Live Workflow Snapshot
                  </div>

                  <div className="neo-live-list">

                    {firstSection?.snapShot?.map((item,key)=>
                    <div className="neo-live-item" key={key}>{item}</div>)}
                    {/* <div className="neo-live-item">QR/Barcode chain-of-custody</div>
                    <div className="neo-live-item">HL7 instrument import</div>
                    <div className="neo-live-item">NeoAI-assisted review</div>
                    <div className="neo-live-item">Digitally signed report delivery</div> */}

                  </div>

                </div>
              </div>

            </div>

          </div>
        </section>


        {/* Why Different */}
        {/* <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Built inside the NeoHealthCard ecosystem"
            title="Not a standalone LIS. A connected diagnostic infrastructure layer."
            subtitle="Linked to NeoHealthCard IDs, clinician workflows, consent, and interoperability — designed for laboratories operating across clinics, hospitals, and networks."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Network}
              title="Ecosystem-native connectivity"
              desc="Patient, Doctor, Hospital, Pharmacy, Insurance — seamlessly connected."
              bullets={[
                "Real-time report delivery to doctor and patient",
                "Insurance authorization-ready workflows",
                "Lifetime medical timeline continuity",
              ]}
            />
            <FeatureCard
              icon={Shield}
              title="Audit-first architecture"
              desc="Every action is logged; every report is traceable."
              bullets={[
                "Tamper-evident audit trails",
                "Report modification logging",
                "Controlled, consent-based sharing",
              ]}
            />
            <FeatureCard
              icon={Brain}
              title="NeoAI-assisted validation"
              desc="AI support for review, alerts, and summaries — clinician-validated."
              bullets={[
                "Anomaly detection + delta checks",
                "Critical value notification workflows",
                "Doctor-facing report summaries",
              ]}
            />
          </div>
        </section> */}

        <section className="lab-ecosystem-section" id="ecosystem">
          <div className="container">
            <div className="neo-section-header">
              <div className="built-system">
                <span className="lab-built-title">Built inside the NeoHealthCard ecosystem</span>
              </div>

              <h2 className="built-title heading-grad" >
                {/* Not a standalone LIS. A connected diagnostic <span className="d-lg-block d-sm-inline"> infrastructure layer.</span> */}
                 {secondSection?.title}
              </h2>

              <p className="neo-built-subtitle ">
               {secondSection?.description ||  ` Linked to NeoHealthCard IDs, clinician workflows, consent, and interoperability —
                designed for  laboratories operating across clinics, hospitals, and networks.`}
              </p>
            </div>
            <div className="row mt-2">
              {secondSection?.model?.map((item,key)=>
              <div className="col-sm-6 col-lg-4 mb-3" key={key}>
                <div className="lab-neo-cards">

                    <div className=" mb-3">
                      <span className="platform-icon-box">
                        <img src={`${base_url}/${item?.image}`} alt="" srcset="" /></span>
                    </div>

                    <h6 className="neo-card-built-title">
                      {item?.name}
                    </h6>

                    <p className="neo-card-desc">
                      Patient, Doctor, Hospital, Pharmacy, Insurance — seamlessly connected.
                    </p>

                    <ul className="neo-bullet-list">
                      {item?.description?.split('.')?.map(b=><li>{b}</li>)}
                      {/* <li>Insurance authorization-ready workflows</li>
                      <li>Lifetime medical timeline continuity</li> */}
                    </ul>

                  </div>
              </div>)}

              {/* Card 2 */}
              {/* <div className="col-sm-6 col-lg-4 mb-3">
                <div className="lab-neo-cards">

                    <div className=" mb-3">
                      <span className="platform-icon-box"><Shield size={20} /></span>
                      
                    </div>

                    <h6 className="neo-card-title">
                      Audit-first architecture
                    </h6>

                    <p className="neo-card-desc">
                      Every action is logged; every report is traceable.
                    </p>

                    <ul className="neo-bullet-list">
                      <li>Tamper-evident audit trails</li>
                      <li>Report modification logging</li>
                      <li>Controlled, consent-based sharing</li>
                    </ul>

                  </div>
              </div> */}

              {/* Card 3 */}
              {/* <div className="col-sm-6 col-lg-4 mb-3">
                <div className="lab-neo-cards">

                    <div className="mb-3">
                     <span className="platform-icon-box"> <Brain size={20} /></span>
                    </div>

                    <h6 className="neo-card-title">
                      NeoAI-assisted validation
                    </h6>

                    <p className="neo-card-desc">
                      AI support for review, alerts, and summaries — clinician-validated.
                    </p>

                    <ul className="neo-bullet-list">
                      <li>Anomaly detection + delta checks</li>
                      <li>Critical value notification workflows</li>
                      <li>Doctor-facing report summaries</li>
                    </ul>

                  </div>
              </div> */}

            </div>

          </div>
        </section>





        <section id="capabilities" className="neo-capabilities">
          <div className="container">
            <div className="neo-section-header">
              <div className="built-system">
               <span className="lab-built-title"> Core Laboratory Capabilities</span>
              </div>

              <h2 className="built-title heading-grad ">
               {thirdSection?.title ||'From order to verified report — fully orchestrated'}
              </h2>

              <p className="neo-built-subtitle">
                {thirdSection?.description || 'Designed for multi-department labs: Hematology, Biochemistry, Microbiology, Pathology, Molecular, and more.'}
              </p>
            </div>

            <div className="row ">
              {thirdSection?.model?.map((item,key)=>
              <div className="col-lg-6 mb-3">
                <div className="lab-neo-cards ">
                  <div className="mb-3"><span className="platform-icon-box">
                    <img src={`${base_url}/${item?.image}`} alt="" srcset="" /></span></div>
                  <h6 className="neo-card-title">{item?.name}</h6>
                  {/* <p className="neo-card-desc">
                    {item?.description?.split('.')[0]}
                  </p> */}
                  <ul className="neo-bullet-list">
                    {item?.description?.split('.')?.map(d=>
                    <li>{d}</li>)}
                  </ul>
                </div>
              </div>)}


            </div>
          </div>
        </section>


          <section id="roles" className="role-section">
            <div className="container ">
              <div className="neo-section-header">
                <div className="built-system">
                 <span className="lab-built-title"> Multi-role Laboratory Console</span>
                </div>

                <h2 className="built-title heading-grad ">
                  {fourthSection?.title}
                </h2>

                <p className="neo-built-subtitle">
                  {fourthSection?.description}
                </p>
              </div>

              <div className="row">
                {fourthSection?.model?.map((item,key)=>
                <div className="col-md-6 mb-3" key={key}>
                  <div className="lab-neo-cards ">
                    <div className=" mb-3"> <span className="platform-icon-box">
                      <img src={`${base_url}/${item?.image}`} alt="" srcset="" /></span> </div>
                    <h6 className="neo-card-title">{item?.name}</h6>
                    {/* <p className="neo-card-desc">
                      Full operational control across branches and systems.
                    </p> */}
                    <ul className="neo-bullet-list">
                     {item?.description?.split('.')?.map(d=> <li>{d}</li>)}
                      
                    </ul>
                  </div>
                </div>)}


              </div>

            </div>
          </section>
        

        

        <section id="connectivity" className="connectivity-section">
          <div className="container">
            <div className="neo-section-header">
              <div className="built-system">
                <span className="lab-built-title">Ecosystem Connectivity</span>
              </div>

              <h2 className="built-title heading-grad ">
                {fivethSection?.title}
              </h2>

              <p className="neo-built-subtitle">
                {fivethSection?.description}
              </p>
            </div>

            <div className="row ">

           
              {fivethSection?.model?.map((item,key)=>
              <div className="col-md-6 col-sm-12 col-lg-4 mb-3" key={key}>
                <div className="lab-neo-cards ">
                  <div className=" mb-3">
                    
                    <span className="platform-icon-box">
                      <img src={`${base_url}/${item?.image}`} alt="" />
                    </span>
                  </div>

                  <h6 className="neo-card-title">{item?.name}</h6>

                  {/* <p className="neo-card-desc">
                    Orders and reports sync directly to clinical workflows.
                  </p> */}

                  <ul className="neo-bullet-list">
                    {item?.description?.split('.')?.map(d=><li>{d}</li>)}
                    
                  </ul>
                </div>
              </div>)}

           
            </div>

          </div>
        </section>

        {/* Analytics */}
        {/* <section id="analytics" className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Advanced Analytics"
            title="Operational intelligence that improves turnaround time"
            subtitle="Actionable metrics for quality, throughput, and compliance across departments and branches."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[{ label: "Turnaround time", icon: Activity }, { label: "Test volume", icon: BarChart3 }, { label: "Quality metrics", icon: Shield }, { label: "Revenue visibility", icon: ClipboardList }].map(
              (m, i) => (
                <Card key={i} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-2">
                        <m.icon className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{m.label}</div>
                        <div className="text-xs text-gray-500">Real-time dashboards</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </section> */}

        <section id="analytics" className="analytics-section">
           <div className="neo-section-header">
              <div className="built-system">
                <span className="lab-built-title">Ecosystem Analytics</span>
              </div>

              <h2 className="built-title heading-grad ">
                {sixSection?.title}
              </h2>

              <p className="neo-built-subtitle">
                {sixSection?.description}
              </p>
            </div>

          <div className="container">
            <div className="row ">

              {sixSection?.model?.map((item,key)=>
              <div className="col-sm-12 col-md-6 col-lg-3 mb-3" key={key}>
                <div className="analytics-card">
                  <div className="analytics-item">
                    <div className="">
                      <span className="platform-icon-box">
                        <img src={`${base_url}/${item?.image}`} alt="" />
                      </span>
                    </div>
                    <div>
                      <h4 className="analytics-title">{item?.name}</h4>
                      <p className="analytics-subtitle">{item?.description}</p>
                    </div>
                  </div>
                </div>
              </div>)}


            </div>
          </div>
        </section>


        {/* <section id="contact" className="mx-auto mt-20 max-w-6xl px-4 pb-16 sm:px-6">
          <Card className="rounded-3xl border border-gray-200 bg-gray-50">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Upgrade your laboratory infrastructure
                </h3>
                <p className="mt-3 text-sm text-gray-600">
                  Connect your lab to NeoHealthCard IDs, doctor workflows, and secure clinical intelligence.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <Button asChild>
                    <a href="#">Request Integration Consultation</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="#">Become a Laboratory Partner</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section> */}

        <section id="contact" className="contact-section">
          <div className="container">

            <div className="contact-card">
              <div className="contact-content text-center">

                <h3 className="contact-title">
                  {sevenSection?.title}
                </h3>

                <p className="contact-desc">
                  {sevenSection?.description}
                </p>

                <div className="contact-btns d-flex justify-content-center">
                  {/* <a href={sevenSection?.btnLink?.first} target="_blank" className="lb-thm-btn ">
                    Request Integration Consultation
                  </a> */}

                  <a href="#"   data-bs-toggle="modal" data-bs-target="#contactQuery" className=" lb-thm-btn  outline">
                    Become a Laboratory Partner
                  </a>
                </div>

              </div>
            </div>

          </div>
        </section>


        {/* Proper Footer */}
        {/* <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="grid gap-10 md:grid-cols-4">
              <div>
                <div className="text-sm font-semibold text-gray-900">NeoHealthCard Laboratory</div>
                <p className="mt-3 text-sm text-gray-600">
                  Secure, interoperable diagnostic infrastructure built for modern healthcare ecosystems.
                </p>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-900">Platform</div>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li><a href="#capabilities" className="hover:text-gray-900">Capabilities</a></li>
                  <li><a href="#security" className="hover:text-gray-900">Security</a></li>
                  <li><a href="#roles" className="hover:text-gray-900">Roles</a></li>
                  <li><a href="#analytics" className="hover:text-gray-900">Analytics</a></li>
                </ul>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-900">Legal</div>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-gray-900">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-gray-900">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-gray-900">Clinical Safety Statement</a></li>
                  <li><a href="#" className="hover:text-gray-900">Governance & Compliance</a></li>
                </ul>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-900">Contact</div>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li>Email: support@neohealthcard.com</li>
                  <li>Global Interoperable Infrastructure</li>
                </ul>
              </div>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-6 text-xs text-gray-500">
              © {year} NeoHealthCard. All rights reserved.
            </div>
          </div>
        </footer> */}

        <ContactQuery/>
      </main>
    </div>
  );
}
