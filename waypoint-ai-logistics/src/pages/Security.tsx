import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Security = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Document Header */}
      <section className="pt-32 pb-12 bg-slate-50 border-b-2 border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 text-center">
            SECURITY POLICY
          </h1>
          <div className="text-center text-sm text-slate-600 space-y-1">
            <p>WayPoint Logistics Management System</p>
            <p>Effective Date: September 1, 2025</p>
            <p>Last Updated: September 1, 2025</p>
          </div>
        </div>
      </section>

      {/* Document Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="prose prose-slate max-w-none">
            
            {/* 1. Introduction */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                1. INTRODUCTION
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                This Security Policy ("Policy") establishes the security standards, procedures, and controls implemented 
                by WayPoint, Inc. ("WayPoint," "we," "us," or "our") to protect the confidentiality, integrity, and 
                availability of our logistics management system and the data processed within it.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                This Policy applies to all aspects of the WayPoint Services, including our mobile applications, web 
                dashboard, API services, and supporting infrastructure. All employees, contractors, and third-party 
                service providers with access to WayPoint systems are required to comply with this Policy.
              </p>
            </div>

            {/* 2. Security Framework */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                2. SECURITY FRAMEWORK AND GOVERNANCE
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                2.1 Security Governance
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint maintains a comprehensive information security management system (ISMS) based on ISO/IEC 27001 
                standards. Our security governance structure includes:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Executive oversight through a Chief Information Security Officer (CISO)</li>
                <li>Security steering committee with cross-functional representation</li>
                <li>Defined security policies, standards, and procedures</li>
                <li>Regular security risk assessments and management reviews</li>
                <li>Continuous monitoring and improvement of security controls</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                2.2 Security Principles
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our security framework is built upon the following core principles:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Defense in Depth:</strong> Multiple layers of security controls to protect against threats</li>
                <li><strong>Zero Trust Architecture:</strong> Verification of every access request regardless of source</li>
                <li><strong>Least Privilege Access:</strong> Users granted minimum necessary permissions for their roles</li>
                <li><strong>Security by Design:</strong> Security considerations integrated throughout development lifecycle</li>
                <li><strong>Continuous Monitoring:</strong> Ongoing surveillance and assessment of security posture</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                2.3 Compliance and Certifications
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint maintains compliance with the following security standards and regulations:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>ISO/IEC 27001:</strong> Information security management system certification</li>
                <li><strong>SOC 2 Type II:</strong> Service Organization Control reports covering security, availability, 
                and confidentiality</li>
                <li><strong>GDPR:</strong> General Data Protection Regulation compliance for European data protection</li>
                <li><strong>CCPA:</strong> California Consumer Privacy Act compliance</li>
                <li><strong>NIST Cybersecurity Framework:</strong> Alignment with National Institute of Standards and 
                Technology guidelines</li>
              </ul>
            </div>

            {/* 3. Data Security */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                3. DATA SECURITY
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                3.1 Encryption Standards
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                All data processed by WayPoint is protected using industry-standard encryption:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Data in Transit:</strong> All data transmissions are encrypted using Transport Layer Security 
                (TLS) 1.3 or higher with strong cipher suites (minimum 256-bit encryption). This applies to all API 
                communications, web dashboard access, mobile application traffic, and third-party integrations.</li>
                <li><strong>Data at Rest:</strong> All stored data is encrypted using Advanced Encryption Standard (AES) 
                with 256-bit keys. This includes database records, file storage, backup archives, and log files.</li>
                <li><strong>Key Management:</strong> Encryption keys are managed using hardware security modules (HSMs) 
                and rotated regularly according to established cryptographic key management procedures.</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                3.2 Database Security
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Database security measures include:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Encryption of database files and transaction logs</li>
                <li>Secure authentication and authorization for database access</li>
                <li>Network isolation of database servers</li>
                <li>Regular security patching and updates</li>
                <li>Database activity monitoring and audit logging</li>
                <li>Parameterized queries to prevent SQL injection attacks</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                3.3 Data Classification and Handling
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Data is classified according to sensitivity levels, and appropriate controls are applied:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Highly Confidential:</strong> Authentication credentials, personal identification information, 
                financial data</li>
                <li><strong>Confidential:</strong> Customer operational data, delivery information, location data</li>
                <li><strong>Internal Use:</strong> System logs, performance metrics, aggregate analytics</li>
                <li><strong>Public:</strong> Marketing materials, public documentation</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                3.4 Data Backup and Recovery
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint maintains comprehensive backup and disaster recovery procedures:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Automated daily backups of all production data</li>
                <li>Encrypted backup storage in geographically distributed locations</li>
                <li>Regular testing of backup restoration procedures</li>
                <li>Recovery Point Objective (RPO) of 24 hours</li>
                <li>Recovery Time Objective (RTO) of 4 hours for critical systems</li>
                <li>Documented disaster recovery and business continuity plans</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                3.5 Data Retention and Disposal
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Data retention and secure disposal procedures:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Data retained only as long as necessary for business and legal requirements</li>
                <li>Secure deletion of data upon retention period expiration</li>
                <li>Cryptographic erasure of encryption keys for irreversible data destruction</li>
                <li>Physical destruction of storage media containing sensitive data</li>
                <li>Documented data disposal procedures with audit trails</li>
              </ul>
            </div>

            {/* 4. Access Control and Authentication */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                4. ACCESS CONTROL AND AUTHENTICATION
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                4.1 User Authentication
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Strong authentication mechanisms are enforced for all user accounts:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Password Requirements:</strong> Minimum 12 characters with complexity requirements including 
                uppercase, lowercase, numbers, and special characters</li>
                <li><strong>Multi-Factor Authentication (MFA):</strong> Required for all user accounts, with support for 
                TOTP (Time-based One-Time Password), SMS, and biometric authentication</li>
                <li><strong>Password Hashing:</strong> Passwords stored using Argon2id with salt and high computational cost</li>
                <li><strong>Account Lockout:</strong> Automatic lockout after five (5) consecutive failed login attempts</li>
                <li><strong>Session Management:</strong> Secure session tokens with automatic expiration after 8 hours of 
                inactivity</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                4.2 Role-Based Access Control (RBAC)
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Access to system resources is controlled through a comprehensive RBAC system:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Granular permissions assigned based on job functions and responsibilities</li>
                <li>Principle of least privilege enforced for all user roles</li>
                <li>Separation of duties for critical operations</li>
                <li>Regular review and recertification of user access rights</li>
                <li>Immediate revocation of access upon termination or role change</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                4.3 Administrative Access
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Administrative and privileged access is subject to enhanced controls:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Privileged access granted only when necessary and for limited duration</li>
                <li>Enhanced MFA requirements for administrative accounts</li>
                <li>Privileged session recording and monitoring</li>
                <li>Regular audit of administrative activities</li>
                <li>Segregated administrative accounts separate from standard user accounts</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                4.4 API Security
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                API access is secured through multiple mechanisms:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>OAuth 2.0 and API key authentication</li>
                <li>Rate limiting and throttling to prevent abuse</li>
                <li>Input validation and sanitization for all API requests</li>
                <li>API access logging and monitoring</li>
                <li>Regular security testing of API endpoints</li>
              </ul>
            </div>

            {/* 5. Network and Infrastructure Security */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                5. NETWORK AND INFRASTRUCTURE SECURITY
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                5.1 Network Architecture
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint's network infrastructure implements multiple security layers:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Network Segmentation:</strong> Logical separation of production, development, and administrative 
                networks</li>
                <li><strong>Firewall Protection:</strong> Next-generation firewalls with stateful packet inspection and 
                application-layer filtering</li>
                <li><strong>DDoS Protection:</strong> Distributed denial-of-service mitigation through cloud-based protection 
                services</li>
                <li><strong>Intrusion Detection and Prevention:</strong> Real-time monitoring and automated response to 
                network threats</li>
                <li><strong>Virtual Private Networks (VPN):</strong> Encrypted VPN required for remote administrative access</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                5.2 Cloud Infrastructure Security
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint utilizes enterprise-grade cloud infrastructure with security controls including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Infrastructure deployed in SOC 2 certified data centers</li>
                <li>Geographically distributed infrastructure for redundancy</li>
                <li>Infrastructure-as-code for consistent security configurations</li>
                <li>Automated security scanning of cloud resources</li>
                <li>Cloud security posture management (CSPM) tools</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                5.3 Physical Security
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Data center facilities maintain comprehensive physical security:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>24/7 security personnel and surveillance</li>
                <li>Biometric access controls and security checkpoints</li>
                <li>Environmental controls for temperature and humidity</li>
                <li>Fire suppression and detection systems</li>
                <li>Redundant power supplies and network connections</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                5.4 Endpoint Security
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                All endpoint devices accessing WayPoint systems must comply with security requirements:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Mandatory endpoint protection software (antivirus, anti-malware)</li>
                <li>Automatic security updates and patch management</li>
                <li>Full-disk encryption for mobile devices</li>
                <li>Mobile device management (MDM) for company-provided devices</li>
                <li>Remote wipe capability for lost or stolen devices</li>
              </ul>
            </div>

            {/* 6. Application Security */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                6. APPLICATION SECURITY
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                6.1 Secure Development Lifecycle
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Security is integrated throughout the software development process:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Security requirements defined during design phase</li>
                <li>Secure coding standards and practices enforced</li>
                <li>Code review process including security considerations</li>
                <li>Static application security testing (SAST) integrated into CI/CD pipeline</li>
                <li>Dynamic application security testing (DAST) before production deployment</li>
                <li>Third-party library vulnerability scanning</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                6.2 Application Security Controls
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Applications incorporate security controls to prevent common vulnerabilities:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Input validation and sanitization to prevent injection attacks</li>
                <li>Output encoding to prevent cross-site scripting (XSS)</li>
                <li>CSRF (Cross-Site Request Forgery) tokens for state-changing operations</li>
                <li>Secure headers including Content Security Policy (CSP)</li>
                <li>Protection against clickjacking and frame injection</li>
                <li>Secure handling of sensitive data in memory and logs</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                6.3 Vulnerability Management
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint maintains a comprehensive vulnerability management program:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Regular vulnerability scanning of all systems and applications</li>
                <li>Annual penetration testing by independent security firms</li>
                <li>Bug bounty program for responsible disclosure of security issues</li>
                <li>Risk-based prioritization of vulnerability remediation</li>
                <li>Critical vulnerabilities patched within 48 hours of discovery</li>
                <li>High-severity vulnerabilities patched within 7 days</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                6.4 Third-Party Components
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Security assessment and management of third-party software components:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Inventory of all third-party libraries and dependencies</li>
                <li>Automated vulnerability scanning of dependencies</li>
                <li>Regular updates to address known vulnerabilities</li>
                <li>Security review of new third-party components before adoption</li>
                <li>Vendor security assessments for critical integrations</li>
              </ul>
            </div>

            {/* 7. Security Monitoring and Incident Response */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                7. SECURITY MONITORING AND INCIDENT RESPONSE
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                7.1 Security Monitoring
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Continuous monitoring of security events and potential threats:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>24/7 Security Operations Center (SOC) monitoring</li>
                <li>Security Information and Event Management (SIEM) system</li>
                <li>Real-time alerting for suspicious activities and security events</li>
                <li>Log aggregation and analysis from all system components</li>
                <li>User behavior analytics to detect anomalous activities</li>
                <li>Threat intelligence integration for proactive threat detection</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                7.2 Logging and Audit Trails
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Comprehensive logging for security monitoring and forensic analysis:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Detailed audit logs of all authentication attempts and access events</li>
                <li>Logging of administrative activities and privilege escalations</li>
                <li>Database access and modification logs</li>
                <li>API request and response logging</li>
                <li>Log retention for minimum of 90 days with extended retention for security events</li>
                <li>Tamper-proof log storage with integrity verification</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                7.3 Incident Response
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint maintains a formal incident response program:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Documented incident response plan and procedures</li>
                <li>Designated incident response team with defined roles and responsibilities</li>
                <li>Incident classification and severity levels</li>
                <li>Defined escalation procedures for critical incidents</li>
                <li>Incident communication protocols for affected parties</li>
                <li>Post-incident review and lessons learned documentation</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                7.4 Security Incident Notification
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                In the event of a security incident affecting customer data:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Affected customers will be notified within 72 hours of incident discovery</li>
                <li>Notification will include nature of incident, affected data, and remediation steps</li>
                <li>Coordination with law enforcement and regulatory authorities as required</li>
                <li>Documentation of incident response activities and outcomes</li>
              </ul>
            </div>

            {/* 8. Personnel Security */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                8. PERSONNEL SECURITY
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                8.1 Background Checks
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                All employees with access to customer data or production systems undergo background verification 
                appropriate to their role and in compliance with local laws.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                8.2 Security Training
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Comprehensive security awareness and training program:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Security awareness training required for all employees upon hire</li>
                <li>Annual refresher training on security policies and procedures</li>
                <li>Role-specific security training for developers and administrators</li>
                <li>Phishing awareness training and simulated phishing exercises</li>
                <li>Security incident reporting procedures training</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                8.3 Confidentiality Agreements
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                All employees, contractors, and third parties with access to sensitive information are required to 
                sign confidentiality and non-disclosure agreements.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                8.4 Termination Procedures
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Upon termination or role change:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Immediate revocation of system access and credentials</li>
                <li>Return of company equipment and access devices</li>
                <li>Reminder of ongoing confidentiality obligations</li>
                <li>Exit interview covering security responsibilities</li>
              </ul>
            </div>

            {/* 9. Third-Party Security */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                9. THIRD-PARTY SECURITY
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                9.1 Vendor Security Assessment
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                All third-party service providers with access to WayPoint systems or data undergo security assessment:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Security questionnaires and documentation review</li>
                <li>Evaluation of security certifications (SOC 2, ISO 27001, etc.)</li>
                <li>Risk assessment based on data access and criticality</li>
                <li>Contractual security requirements and data protection obligations</li>
                <li>Annual reassessment of vendor security posture</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                9.2 Data Processing Agreements
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Third parties processing customer data on behalf of WayPoint are required to execute data processing 
                agreements that include:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Scope and purpose of data processing</li>
                <li>Security and confidentiality obligations</li>
                <li>Data breach notification requirements</li>
                <li>Subprocessor requirements and restrictions</li>
                <li>Rights to audit security controls</li>
              </ul>
            </div>

            {/* 10. Business Continuity */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                10. BUSINESS CONTINUITY AND DISASTER RECOVERY
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                10.1 Business Continuity Planning
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint maintains comprehensive business continuity and disaster recovery plans:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Documented business impact analysis and risk assessment</li>
                <li>Defined recovery time objectives (RTO) and recovery point objectives (RPO)</li>
                <li>Redundant infrastructure across geographically distributed locations</li>
                <li>Automated failover capabilities for critical services</li>
                <li>Regular testing of disaster recovery procedures (minimum quarterly)</li>
                <li>Communication plans for service disruptions</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                10.2 Service Availability
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint targets 99.9% uptime for production services, with the following provisions:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>High-availability architecture with redundant components</li>
                <li>Load balancing and auto-scaling capabilities</li>
                <li>Scheduled maintenance during off-peak hours with advance notice</li>
                <li>Real-time status monitoring and public status page</li>
              </ul>
            </div>

            {/* 11. User Responsibilities */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                11. USER SECURITY RESPONSIBILITIES
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Users of WayPoint Services share responsibility for maintaining security and must adhere to the 
                following requirements:
              </p>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                11.1 Account Security
              </h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Use strong, unique passwords that are not shared or reused across multiple services</li>
                <li>Enable and properly configure multi-factor authentication</li>
                <li>Protect account credentials from unauthorized disclosure</li>
                <li>Log out from shared or public devices after use</li>
                <li>Report suspected unauthorized access or security incidents immediately</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                11.2 Device Security
              </h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Keep devices and applications up to date with latest security patches</li>
                <li>Use reputable antivirus and anti-malware software</li>
                <li>Enable device encryption and screen locks</li>
                <li>Only access WayPoint Services from secure, trusted networks</li>
                <li>Avoid using public Wi-Fi networks for sensitive operations</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                11.3 Data Protection
              </h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Handle sensitive data in accordance with applicable data protection regulations</li>
                <li>Implement appropriate access controls within your organization</li>
                <li>Limit data access to authorized personnel on a need-to-know basis</li>
                <li>Maintain regular backups of critical data</li>
                <li>Securely dispose of data when no longer needed</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                11.4 Prohibited Activities
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Users must not engage in activities that compromise security, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Attempting to bypass security controls or access unauthorized areas</li>
                <li>Sharing account credentials with unauthorized individuals</li>
                <li>Using automated tools to scrape or harvest data without authorization</li>
                <li>Introducing malicious software or conducting security testing without permission</li>
                <li>Misusing or abusing the Services in violation of Terms of Service</li>
              </ul>
            </div>

            {/* 12. Security Reporting */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                12. SECURITY ISSUE REPORTING
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                12.1 Responsible Disclosure
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint encourages responsible disclosure of security vulnerabilities. If you discover a security 
                issue, please report it to our security team:
              </p>
              <div className="bg-slate-50 p-6 rounded border border-slate-200 mb-4">
                <p className="text-slate-700 mb-2"><strong>Security Contact Information:</strong></p>
                <p className="text-slate-700 mb-2">Email: security@waypoint.com</p>
                <p className="text-slate-700 mb-2">PGP Key: Available at https://waypoint.com/security-pgp</p>
                <p className="text-slate-700">Phone: +1 (555) 123-4567 (Security Hotline)</p>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                12.2 Responsible Disclosure Guidelines
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                When reporting security vulnerabilities:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Provide detailed information about the vulnerability and steps to reproduce</li>
                <li>Do not access or modify data belonging to other users</li>
                <li>Do not disclose the vulnerability publicly until WayPoint has addressed it</li>
                <li>Allow reasonable time for investigation and remediation</li>
                <li>Act in good faith to avoid privacy violations and service disruption</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                12.3 Bug Bounty Program
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint operates a bug bounty program that rewards security researchers for identifying and 
                responsibly disclosing security vulnerabilities. Program details and eligibility requirements 
                are available at https://waypoint.com/bug-bounty.
              </p>
            </div>

            {/* 13. Policy Updates */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                13. POLICY UPDATES AND REVIEWS
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                This Security Policy is reviewed and updated at least annually, or more frequently as needed to 
                address emerging threats, technological changes, or regulatory requirements.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                Material changes to this Policy will be communicated to users via email or through the Services. 
                Continued use of the Services after such notification constitutes acceptance of the updated Policy.
              </p>
            </div>

            {/* 14. Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                14. CONTACT INFORMATION
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                For questions, concerns, or requests regarding this Security Policy or our security practices, 
                please contact:
              </p>
              <div className="bg-slate-50 p-6 rounded border border-slate-200 mb-4">
                <p className="text-slate-700 mb-2"><strong>WayPoint, Inc.</strong></p>
                <p className="text-slate-700 mb-2">Chief Information Security Officer (CISO)</p>
                <p className="text-slate-700 mb-2">Email: security@waypoint.com</p>
                <p className="text-slate-700 mb-2">Phone: +1 (555) 123-4567</p>
                <p className="text-slate-700">Address: 123 Logistics Way, San Francisco, CA 94105, United States</p>
              </div>
            </div>

            {/* Footer Statement */}
            <div className="mt-12 pt-8 border-t-2 border-slate-300">
              <p className="text-sm text-slate-600 text-center">
                This Security Policy was last updated on September 1, 2025 and is effective as of that date.
              </p>
              <p className="text-sm text-slate-600 text-center mt-2">
                © 2025 WayPoint, Inc. All rights reserved.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Security;
