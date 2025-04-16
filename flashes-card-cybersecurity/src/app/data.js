const flashcardsData = `
# Module 1: The Danger.pdf
- Question: Which organization is an international nonprofit organization that offers the CISSP certification?
  Answer: (ISC)2 is an international nonprofit organization that offers the CISSP certification.
- Question: What is the dark web?
  Answer: It is part of the internet that can only be accessed with special software.
- Question: What are two examples of personally identifiable information (PII)?
  Answer: Credit card number and street address are examples of PII. PII is any data that could potentially identify and track a specific individual.
- Question: A company has just had a cybersecurity incident. The threat actor appeared to have a goal of network disruption and appeared to use a common security hack tool that overwhelmed a particular server with a large amount of traffic. How would a certified cybersecurity analyst classify this type of threat actor?
  Answer: Amateur. Amateurs or script kiddies use common, existing tools found on the internet to launch attacks.
- Question: Which regulatory law regulates the identification, storage, and transmission of patient personal healthcare information?
  Answer: HIPAA (Health Insurance Portability and Accountability Act) requires that all patient personally identifiable healthcare information be stored, maintained, and transmitted in ways that ensure patient privacy and confidentiality.
- Question: A worker in the records department of a hospital accidentally sends a medical record of a patient to a printer in another department. When the worker arrives at the printer, the patient record printout is missing. What breach of confidentiality does this situation describe?
  Answer: PHI (Protected Health Information). PHI includes patient name, addresses, visiting dates and more. HIPAA regulates and provides severe penalties for breaches of PHI.
- Question: What type of cyberwarfare weapon was Stuxnet?
  Answer: Worm. The Stuxnet worm was an excellent example of a sophisticated cyberwarfare weapon. In 2010, it was used to attack programmable logic controllers that operated uranium enrichment centrifuges in Iran.
- Question: Which statement describes cyberwarfare?
  Answer: It is Internet-based conflict that involves the penetration of information systems of other nations.
- Question: What is the main purpose of cyberwarfare?
  Answer: To gain advantage over adversaries, whether they are nations or competitors.
- Question: An employee connects wirelessly to the company network using a cell phone. The employee then configures the cell phone to act as a wireless access point that will allow new employees to connect to the company network. Which type of security threat best describes this situation?
  Answer: Rogue access point. The employee unknowingly breached the security of the company network by allowing a user to access the network without connecting through the company access point.
- Question: What websites should a user avoid when connecting to a free and open wireless hotspot?
  Answer: Websites to make purchases. Many free and open wireless hotspots operate with no authentication or weak authentication mechanisms. Attackers could easily capture network traffic and steal user information.
- Question: In a smart home, an owner has connected many home devices to the Internet. The owner is concerned that these devices will make the wireless network vulnerable to attacks. What action could be taken to address this issue?
  Answer: Install the latest firmware versions for the devices. IoT devices have to be updated with the latest firmware to be secure.
- Question: Why do IoT devices pose a greater risk than other computing devices on a network?
  Answer: Most IoT devices do not receive frequent firmware updates. IoT devices commonly operate using their original firmware and do not receive updates as frequently as laptops, desktops, and mobile platforms.
- Question: Which cyber attack involves a coordinated attack from a botnet of zombie computers?
  Answer: DDoS (Distributed Denial of Service). A DDoS attack is launched from multiple coordinated sources. The sources of the attack are zombie hosts that the cybercriminal has built into a botnet.
- Question: Which example illustrates how malware might be concealed?
  Answer: An email is sent to the employees of an organization with an attachment that looks like an antivirus update, but the attachment actually consists of spyware.

# Module 2: Fighters in the War Against Cybercrime.pdf
- Question: What is a benefit to an organization of using SOAR as part of the SIEM system?
  Answer: SOAR automates incident investigation and responds to workflows based on playbooks. SOAR integrates threat intelligence and automates incident investigation.
- Question: Which personnel in a SOC are assigned the task of hunting for potential threats and implementing threat detection tools?
  Answer: Tier 3 SME. In a SOC, Tier 3 SMEs have expert-level skills in network, endpoint, threat intelligence, and malware reverse engineering (RE). They are deeply involved in hunting for potential security threats.
- Question: Which three technologies should be included in a SOC security information and event management system?
  Answer: Security monitoring, threat intelligence, and log management. Technologies in a SOC should include event collection/correlation/analysis, security monitoring, security control, log management, vulnerability assessment, vulnerability tracking, and threat intelligence.
- Question: The term cyber operations analyst refers to which group of personnel in a SOC?
  Answer: Tier 1 personnel. In a typical SOC, the Tier 1 personnel are called alert analysts, also known as cyberoperations analysts.
- Question: How does a security information and event management system (SIEM) in a SOC help the personnel fight against security threats?
  Answer: By combining data from multiple sources to help SOC personnel collect and filter data, detect and classify threats, analyze and investigate threats, and manage resources.
- Question: An SOC is searching for a professional to fill a job opening. The employee must have expert-level skills in networking, endpoint, threat intelligence, and malware reverse engineering. Which job within an SOC requires these skills?
  Answer: Threat Hunter. Tier 3 professionals called Threat Hunters must have expert-level skills in networking, endpoint, threat intelligence, and malware reverse engineering.
- Question: Which three are major categories of elements in a security operations center?
  Answer: People, processes, and technologies are the three major categories of elements of a security operations center.
- Question: Which KPI metric does SOAR use to measure the time required to stop the spread of malware in the network?
  Answer: Time to Control is the time required to stop the spread of malware in the network.
- Question: What job would require verification that an alert represents a true security incident or a false positive?
  Answer: Alert Analyst. A Cybersecurity Analyst monitors security alert queues and uses a ticketing system to assign alerts to a queue for an analyst to investigate.
- Question: When a user turns on the PC on Wednesday, the PC displays a message indicating that all of the user files have been locked and requires payment. What type of malware could be responsible?
  Answer: Ransomware. Ransomware requires payment for access to the computer or files. Bitcoin is a type of digital currency often used for ransom payments.
- Question: A group of users on the same network are all complaining about their computers running slowly. After investigating, the technician determines that these computers are part of a zombie network. Which type of malware is used to control these computers?
  Answer: Botnet. A botnet is a network of infected computers called a zombie network. The computers are controlled by a hacker and are used to attack other computers or to steal data.

# Module 3: Windows Operating System.pdf
- Question: What is the outcome when a Linux administrator enters the man man command?
  Answer: The man man command provides documentation about the man command. The man command is short for manual and is used to obtain documentation about a Linux command.
- Question: What is the purpose of using the net accounts command in Windows?
  Answer: To review the settings of password and logon requirements for users. When used without options, the net accounts command displays the current settings for password, logon limitations, and domain information.
- Question: A PC user issues the netstat command without any options. What is displayed as the result of this command?
  Answer: A list of all established active TCP connections. When used by itself (without any options), the netstat command will display all the active TCP connections that are available.
- Question: What is the purpose of entering the netsh command on a Windows PC?
  Answer: To configure networking parameters for the PC. The netsh.exe tool can be used to configure networking parameters for the PC from a command prompt.
- Question: Which type of Windows PowerShell command performs an action and returns an output or object to the next command that will be executed?
  Answer: Cmdlets. The types of commands that PowerShell can execute include cmdlets (which perform an action and return an output), PowerShell scripts (files with a .ps1 extension), and PowerShell functions (pieces of code that can be referenced in a script).
- Question: A user creates a file with .ps1 extension in Windows. What type of file is it?
  Answer: PowerShell script. Files with a .ps1 extension contain PowerShell commands that are executed.
- Question: A user logs in to Windows with a regular user account and attempts to use an application that requires administrative privileges. What can the user do to successfully use the application?
  Answer: Right-click the application and choose Run as Administrator. As a security best practice, it is advisable not to log on to Windows using the Administrator account or an account with administrative privileges.
- Question: An IT technician wants to create a rule on two Windows 10 computers to prevent an installed application from accessing the public Internet. Which tool would the technician use to accomplish this task?
  Answer: Windows Defender Firewall with Advanced Security. This tool is used to create inbound and outbound rules, connection security rules such as security traffic between two computers, and monitoring any active connection security rules.
- Question: What technology was created to replace the BIOS program on modern personal computer motherboards?
  Answer: UEFI. As of 2015, most personal computer motherboards are shipped with UEFI as the replacement for the BIOS program.
- Question: What are two advantages of the NTFS file system compared with FAT32?
  Answer: NTFS supports larger files and provides more security features. The file system has no control over the speed of access or formatting of drives, and the ease of configuration is not file system-dependent.
- Question: Which two commands could be used to check if DNS name resolution is working properly on a Windows PC?
  Answer: Nslookup cisco.com and ping cisco.com. The ping command tests the connection between two hosts. When ping uses a host domain name, the resolver on the PC will first perform name resolution. Nslookup is a tool for testing and troubleshooting DNS servers.
- Question: Which statement describes the function of the Server Message Block (SMB) protocol?
  Answer: It is used to share network resources. The Server Message Block (SMB) protocol is primarily used by Microsoft to share network resources.
- Question: Which Windows tool can be used by a cybersecurity administrator to secure stand-alone computers that are not part of an active directory domain?
  Answer: Local Security Policy. Windows systems that are not part of an Active Directory Domain can use the Windows Local Security Policy to enforce security settings on each stand-alone system.

# Module 4: Linux Overview.pdf
- Question: Why would a network administrator choose Linux as an operating system in the Security Operations Center (SOC)?
  Answer: The administrator has more control over the operating system. There are several reasons why Linux is a good choice for the SOC: It's open source, the command line interface is powerful, the user has more control over the OS, and Linux allows for better network communication control.
- Question: Which two methods can be used to harden a computing device?
  Answer: Enforce the password history mechanism and ensure physical security. Basic best practices for device hardening include ensuring physical security, minimizing installed packages, disabling unused services, using SSH and disabling root account login over SSH, keeping the system updated, disabling USB auto-detection, enforcing strong passwords, forcing periodic password changes, keeping users from reusing old passwords, and reviewing logs regularly.
- Question: Which Linux command can be used to display the name of the current working directory?
  Answer: pwd. One of the most important commands in Linux is the pwd command, which stands for print working directory. It shows users the physical path for the directory they are working in.
- Question: A Linux system boots into the GUI by default, so which application can a network administrator use in order to access the CLI environment?
  Answer: Terminal emulator. A terminal emulator is an application program a user of Linux can use in order to access the CLI environment.
- Question: What is the well-known port address number used by DNS to serve requests?
  Answer: 53. Port numbers are used in TCP and UDP communications to differentiate between the various services running on a device. The well-known port number used by DNS is port 53.
- Question: Which user can override file permissions on a Linux computer?
  Answer: Root user. A user has as much rights to a file as the file permissions allow. The only user that can override file permission on a Linux computer is the root user. Because the root user has the power to override file permissions, the root user can write to any file.
- Question: Which type of tool allows administrators to observe and understand every detail of a network transaction?
  Answer: Packet capture software. Network packet capture software is an important tool because it makes it possible to observe and understand the details of a network transaction.
- Question: Why is Kali Linux a popular choice in testing the network security of an organization?
  Answer: It is an open source Linux security distribution containing many penetration tools. Kali is an open source Linux security distribution that is commonly used by IT professionals to test the security of networks.
- Question: Consider the result of the ls -l command in the Linux output below. What are the file permissions assigned to the sales user for the analyst.txt file? ls -l analyst.txt -rwxrw-r-- sales staff 1028 May 28 15:50 analyst.txt
  Answer: Read, write, execute. The file permissions are displayed in the User Group and Other order. The first set of characters (rwx) means the user "sales" who owns the file can read, write and execute the file.
- Question: In the Linux shell, which character is used between two commands to instruct the shell to combine and execute these two commands in sequence?
  Answer: | (pipe character). In the Linux shell, several commands can be combined to perform a complex task. This technique is known as piping. The piping process is indicated by inserting the character "|" between two consecutive commands.
- Question: Why is Linux considered to be better protected against malware than other operating systems?
  Answer: File system structure, file permissions, and user account restrictions. The Linux operating design including how the file system is structured, standard file permissions, and user account restrictions make Linux a better protected operating system. However, Linux still has vulnerabilities and can have malware installed that affects the operating system.
- Question: What are two benefits of using an ext4 partition instead of ext3?
  Answer: Improved performance and increase in the size of supported files. Based on the ex3 file system, an ext4 partition includes extensions that improve performance and an increase in the of supported files. An ext4 partition also supports journaling, a file system feature that minimizes the risk of file system corruption if power is suddenly lost to the system.

# Module 5: Network Protocols.pdf
- Question: Which two parts are components of an IPv4 address?
  Answer: Host portion and network portion. An IPv4 address is divided into two parts: a network portion to identify the specific network on which a host resides, and a host portion to identify specific hosts on a network.
- Question: What is the full decompressed form of the IPv6 address 2001:420:59:0:1::a/64?
  Answer: 2001:0420:0059:0000:0001:0000:0000:000a. To decompress an IPv6 address, the two rules of compression must be reversed: any 16-bit hextet that has less than four hex characters is missing the leading zeros, and a (::) can be replaced with consecutive zeros that were removed.
- Question: A device has been assigned the IPv6 address of 2001:0db8:cafe:4500:1000:00d8:0058:00ab/64. Which is the host identifier of the device?
  Answer: 1000:00d8:0058:00ab. The address has a prefix length of /64. Thus the first 64 bits represent the network portion, whereas the last 64 bits represent the host portion of the IPv6 address.
- Question: How many host addresses are available on the 192.168.10.128/26 network?
  Answer: 62. A /26 prefix gives 6 host bits, which provides a total of 64 addresses, because 2^6 = 64. Subtracting the network and broadcast addresses leaves 62 usable host addresses.
- Question: What are the three ranges of IP addresses that are reserved for internal private use?
  Answer: 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16. The private IP address blocks that are used inside companies: 10.0.0.0/8 (any address that starts with 10), 172.16.0.0/12 (any address from 172.16 through 172.31), and 192.168.0.0/16 (any address that starts with 192.168).
- Question: What does it mean when a computer has an IP address of 169.254.10.3?
  Answer: The PC cannot contact a DHCP server. When a Windows PC is configured to obtain an IP address automatically and cannot contact a DHCP server, Windows will automatically assign an address belonging to the 169.254.0.0/16 range.
- Question: A computer can access devices on the same network but cannot access devices on other networks. What is the probable cause of this problem?
  Answer: The computer has an invalid default gateway address. The default gateway is the address of the device a host uses to access the Internet or another network. If the default gateway is missing or incorrect, that host will not be able to communicate outside the local network.
- Question: When a wireless network in a small office is being set up, which type of IP addressing is typically used on the networked devices?
  Answer: Private. In setting up the wireless network in a small office, it is a best practice to use private IP addressing because of the flexibility and easy management it offers.

# Module 6: Ethernet and Internet Protocol.pdf
- Question: A user sends an HTTP request to a web server on a remote network. During encapsulation for this request, what information is added to the address field of a frame to indicate the destination?
  Answer: The MAC address of the default gateway. When a frame is encapsulated for a remote host, the source device will not know the MAC address of the remote host. It will use the MAC address of the default gateway.
- Question: What addresses are mapped by ARP?
  Answer: IPv4 address to a destination MAC address. ARP works by mapping a destination MAC address to a destination IPv4 address. The host knows the destination IPv4 address and uses ARP to resolve the corresponding destination MAC address.
- Question: What type of information is contained in an ARP table?
  Answer: IPv4 address to MAC address mappings. ARP tables are used to store mappings of IP addresses to MAC addresses. When a network device needs to forward a packet, the device knows only the IP address. To deliver the packet on an Ethernet network, a MAC address is needed.
- Question: A cybersecurity analyst believes an attacker is spoofing the MAC address of the default gateway to perform a man-in-the-middle attack. Which command should the analyst use to view the MAC address a host is using to reach the default gateway?
  Answer: arp -a. ARP is a protocol used with IPv4 to map a MAC address to an associated specific IP address. The command arp -a will display the MAC address table on a Windows PC.
- Question: What are the two sizes (minimum and maximum) of an Ethernet frame?
  Answer: 64 bytes (minimum) and 1518 bytes (maximum). The minimum Ethernet frame is 64 bytes. The maximum Ethernet frame is 1518 bytes. A network technician must know the minimum and maximum frame size in order to recognize runt and jumbo frames.
- Question: What is the result of an ARP poisoning attack?
  Answer: Client information is stolen. ARP poisoning is a technique used by an attacker to reply to an ARP request with a falsified MAC address. The attacker performs a man-in-the-middle attack, intercepting traffic and possibly stealing information.
- Question: Which field in an IPv4 packet header will typically stay the same during its transmission?
  Answer: Destination Address. The value in the Destination Address field in an IPv4 header will stay the same during its transmission. Other fields like TTL, Flag, and Packet Length might change.

# Module 7: Connectivity Verification.pdf
- Question: What mechanism is used by a router to prevent a received IPv4 packet from traveling endlessly on a network?
  Answer: It decrements the value of the TTL field by 1 and if the result is 0, it discards the packet and sends a Time Exceeded message to the source host. This is how IP prevents packets from traveling endlessly.
- Question: Which two commands can be used on a Windows host to display the routing table?
  Answer: Netstat -r and route print. On a Windows host, the route print or netstat -r commands can be used to display the host routing table. Both commands generate the same output.
- Question: What is the purpose of ICMP messages?
  Answer: To provide feedback of IP packet transmissions. The purpose of ICMP messages is to provide feedback about issues that are related to the processing of IP packets.
- Question: What is the function of the tracert command that differs from the ping command?
  Answer: The tracert command shows the information of routers in the path. The tracert command sends three pings to each hop (router) in the path toward the destination and displays the domain name and IP address of hops.
- Question: A user issues a ping command and receives a response that includes a code of 1. What does this code represent?
  Answer: Host unreachable. When a host or gateway receives a packet that it cannot deliver, it can use an ICMP Destination Unreachable message with code 1 to indicate host unreachable.
- Question: What message informs IPv6 enabled interfaces to use stateful DHCPv6 for obtaining an IPv6 address?
  Answer: The ICMPv6 Router Advertisement. Before an IPv6 enabled interface will use stateful DHCPv6, the interface must receive an ICMPv6 Router Advertisement with the managed configuration flag (M flag) set to 1.
- Question: When a router receives a traceroute packet, at what point would it stop forwarding the packet?
  Answer: When the value in the TTL field reaches zero. When a router receives a traceroute packet, the value in the TTL field is decremented by 1. When the value reaches zero, the router will not forward the packet and will send an ICMP Time Exceeded message.

# Module 8: Address Resolution Protocol (ARP).pdf
- Question: What user gets an IP address of 192.168.0.1 from the company network administrator. A friend of the user at a different company gets the same IP address on another PC. How can two PCs use the same IP address and still reach the Internet?
  Answer: ISPs use Network Address Translation to change a user IP address into an address that can be used on the Internet. As user traffic from behind an ISP firewall reaches the gateway device, NAT changes private IP addresses into public, routable IP addresses.
- Question: Refer to a scenario where PC1 attempts to connect to a file server and sends an ARP request to obtain a destination MAC address. Which MAC address will PC1 receive in the ARP reply?
  Answer: The MAC address of the default gateway interface. PC1 must have a MAC address to use as a destination Layer 2 address. PC1 will send an ARP request as a broadcast and the default gateway router will send back an ARP reply with its interface MAC address.
- Question: From the perspective of users behind a NAT router, what type of NAT address is a public IP address used by external users to reach internal hosts?
  Answer: Inside global. From the perspective of users behind NAT, inside global addresses are used by external users to reach internal hosts. Inside local addresses are the addresses assigned to internal hosts.

# Module 9: The Transport Layer.pdf
- Question: A PC is downloading a large file from a server. The TCP window is 1000 bytes. The server is sending the file using 100-byte segments. How many segments will the server send before it requires an acknowledgment from the PC?
  Answer: 10 segments. With a window of 1000 bytes, the destination host accepts segments until all 1000 bytes of data have been received. With 100-byte segments, this would be 10 segments.
- Question: Which two operations are provided by TCP but not by UDP?
  Answer: Acknowledging received data and retransmitting any unacknowledged data. These are reliability operations to ensure that all of the data arrives at the destination. UDP does not provide reliability.
- Question: Match the characteristic to the protocol category: TCP and UDP.
  Answer: TCP: 3-way handshake, window size. UDP: connectionless, best for VoIP. Both TCP and UDP: Port number, checksum. TCP uses 3-way handshaking and window size for flow control. UDP is connectionless and good for real-time applications.
- Question: What are three responsibilities of the transport layer?
  Answer: Identifying the applications and services that should handle transmitted data, meeting the reliability requirements of applications, and multiplexing multiple communication streams. The transport layer has several responsibilities including tracking communication streams, segmenting data, identifying proper applications through port numbers, and more.
- Question: What type of transmission is used to transmit a single video stream such as a web-based video conference to a select number of users?
  Answer: Multicast. A multicast is used to send to a select group of users. A unicast is a transmission to a single host destination. A broadcast is a transmission sent to all hosts on a destination network.

# Module 10: Network Services.pdf
- Question: What action does a DHCPv4 client take if it receives more than one DHCPOFFER from multiple DHCP servers?
  Answer: It sends a DHCPREQUEST that identifies which lease offer the client is accepting. If there are multiple DHCP servers in a network, it is possible for a client to receive more than one DHCPOFFER. The client will only send one DHCPREQUEST, which includes the server from which the client is accepting the offer.
- Question: What type of information is contained in a DNS MX record?
  Answer: The domain name mapped to mail exchange servers. MX, or mail exchange messages, are used to map a domain name to several mail exchange servers that all belong to the same domain.
- Question: What is the function of the HTTP GET message?
  Answer: To request an HTML page from a web server. Common HTTP message types include: GET (used by clients to request data from the web server), POST (used by clients to upload data to a web server), and PUT (used by clients to upload data to a web server).
- Question: Match each characteristic to the appropriate email protocol, POP versus IMAP.
  Answer: POP: Does not require a centralized backup solution, mail is deleted as it is downloaded. IMAP: Download copies of messages to the client, original messages must be manually deleted, requires a larger amount of disk space.
- Question: What protocol allows a user to keep the original email on the server, organize it into folders, and synchronize the folders between a mobile device and the server?
  Answer: IMAP. The IMAP protocol allows email data to be synchronized between a client and server. Changes made in one location are automatically applied to the other location. POP3 does not synchronize data between client and server.
- Question: What is done to an IP packet before it is transmitted over the physical medium?
  Answer: It is encapsulated in a Layer 2 frame. When messages are sent on a network, the encapsulation process works from the top of the OSI or TCP/IP model to the bottom. At each layer, the upper layer information is encapsulated into the data field of the next protocol.
- Question: Which networking model is being used when an author uploads one chapter document to a file server of a book publisher?
  Answer: Client/server. In the client/server network model, a network device assumes the role of server to provide a particular service such as file transfer and storage. In contrast, a peer-to-peer network does not have a dedicated server.
- Question: Which protocol is a client/server file sharing protocol and also a request/response protocol?
  Answer: SMB. The Server Message Block (SMB) is a client/server file sharing protocol that describes the structure of shared network resources such as directories, files, printers, and serial ports.

# Module 11: Network Communication Devices.pdf
- Question: What action does an Ethernet switch take when it receives a frame with an unknown Layer 2 source address?
  Answer: It records the source address in the address table of the switch. When an Ethernet switch receives a frame with an unknown Layer 2 address, the switch records that address in its address table.
- Question: What is a characteristic of a routed port that is configured on a Cisco switch?
  Answer: It is assigned an IP address. Routed ports on a Cisco switch behave similarly to those on a router. They are configured with an IP address and forward Layer 3 packets. Unlike Layer 2 switch interfaces, routed ports do not support STP, nor do they support subinterfaces.
- Question: What are the three parts of all Layer 2 frames?
  Answer: Header, payload, and frame check sequence. Layer 2 frames have these three components with the frame check sequence at the end.
- Question: What is a characteristic of a hub?
  Answer: Regenerates signals received on one port out all other ports. A hub is a Layer 1 device that regenerates signals out all ports other than the ingress port. All ports on a hub belong to the same collision domain.
- Question: What information within a data packet does a router use to make forwarding decisions?
  Answer: The destination IP address. A Layer 3 device like a router uses a Layer 3 destination IP address to make a forwarding decision.
- Question: What are two types of addresses found on network end devices?
  Answer: MAC address and IP address. Intermediary devices use these two types of addresses when sending messages to the final destination device.
- Question: In which memory location is the routing table of a router maintained?
  Answer: RAM. The routing table of a router is maintained in RAM, which is volatile memory. If a router loses power or is rebooted, the content of RAM is lost and the routing table must be rebuilt.
- Question: What type of route is created when a network administrator manually configures a route that has an active exit interface?
  Answer: Static route. A static route is one that is manually configured by the network administrator.
- Question: Which two routing protocols are link-state routing protocols?
  Answer: OSPF and ISIS. These are both link-state routing protocols. In contrast, EIGRP and RIP are distance vector routing protocols, and BGP is a path vector protocol.
- Question: What routing protocol is used to exchange routes between internet service providers?
  Answer: BGP (Border Gateway Protocol). BGP is a path vector routing protocol and it is used by internet service providers to exchange routes.
- Question: Which two devices would commonly be found at the access layer of the hierarchical enterprise LAN design model?
  Answer: Layer 2 switch and access point. While some designs do route at the access layer, the two devices that should always be placed at the access layer of the hierarchical design model are an access point and a Layer 2 switch.
- Question: What is the function of the distribution layer of the three-layer network design model?
  Answer: Aggregating access layer connections. The function of the distribution layer is to provide connectivity to services and to aggregate the access layer connections.
- Question: What is a characteristic of the WLAN passive discover mode?
  Answer: The AP periodically sends beacon frames containing the SSID. In passive mode, the wireless clients learn what networks and APs are available from beacon frames, sent by the APs, that contain the WLAN SSID, supported standards, and security settings.
- Question: What Wi-Fi management frame is regularly broadcast by APs to announce their presence?
  Answer: Beacon. Beacon frames are broadcast periodically by the AP to advertise its wireless networks to potential clients. Probing, association, and authentication frames are only sent when a client is associating to the AP.
- Question: What is the first step in the CSMA/CA process when a wireless client is attempting to communicate on the wireless network?
  Answer: The client listens for traffic on the channel. When a wireless client is attempting to communicate on the network, it will first listen to the channel to be sure it is idle.
- Question: Which characteristic describes a wireless client operating in active mode?
  Answer: Must know the SSID to connect to an AP. A wireless client operating in active mode must know the name of the SSID. Active mode is used if an AP is configured to not broadcast beacon frames.
- Question: What is used on WLANs to avoid packet collisions?
  Answer: CSMA/CA. WLANs are half-duplex networks which means that only one client can transmit or receive at any given moment. WLANs use carrier sense multiple access with collision avoidance (CSMA/CA) to determine when to send data on the network to avoid packet collisions.
- Question: Lightweight access points forward data between which two devices on the network?
  Answer: Wireless LAN controller and wireless client. In a wireless deployment that is using lightweight access points (LWAPs), the LWAP forwards data between the wireless clients and the wireless LAN controller (WLC).
- Question: A Cisco router is running IOS 15. What are the two routing table entry types that will be added when a network administrator brings an interface up and assigns an IP address to the interface?
  Answer: Local route interface and directly connected interface. A local route interface routing table entry is found when a router runs IOS 15 or higher. Whenever an interface is addressed and enabled, a directly connected interface is automatically shown in the routing table.

# Module 12: Network Security Infrastructure.pdf
- Question: What is an advantage of HIPS that is not provided by IDS?
  Answer: HIPS protects critical system resources and monitors operating system processes. Host-based IPS (HIPS) is software installed on a single host to monitor and analyze suspicious activity. It can monitor and protect operating system and critical system processes that are specific to that host.
- Question: Which statement describes a difference between RADIUS and TACACS+?
  Answer: RADIUS encrypts only the password whereas TACACS+ encrypts all communication. TACACS+ uses TCP, encrypts the entire packet (not just the password), and separates authentication and authorization into two distinct processes.
- Question: What are two disadvantages of using an IDS?
  Answer: The IDS does not stop malicious traffic and requires other devices to respond to attacks. The disadvantage of operating with mirrored traffic is that the IDS cannot stop malicious single-packet attacks from reaching the target before responding. Also, an IDS often requires assistance from other networking devices.
- Question: Which statement describes one of the rules that govern interface behavior in the context of implementing a zone-based policy firewall configuration?
  Answer: By default, traffic is allowed to flow among interfaces that are members of the same zone. An interface can belong to only one zone, and creating a zone is the first step in configuring a zone-based policy firewall.
- Question: Which AAA component can be established using token cards?
  Answer: Authentication. The authentication component of AAA is established using username and password combinations, challenge and response questions, and token cards.
- Question: What is a host-based intrusion detection system (HIDS)?
  Answer: It combines the functionalities of antimalware applications with firewall protection. A current HIDS is a comprehensive security application that combines antimalware functionality with firewall protection. It not only detects malware but also prevents it from executing.
- Question: Which technique is necessary to ensure a private transfer of data using a VPN?
  Answer: Encryption. Confidential and secure transfers of data with VPNs require data encryption.
- Question: Which statement describes a VPN?
  Answer: VPNs use virtual connections to create a private network through a public network. A VPN is a private network that is created over a public network. Instead of using dedicated physical connections, a VPN uses virtual connections routed through a public network.
- Question: Which two components of traditional web security appliances are examples of functions integrated into a Cisco Web Security Appliance?
  Answer: Web reporting and URL filtering. The Cisco Web Security Appliance combines advanced malware protection, application visibility and control, acceptable use policy controls, reporting, and secure mobility functions.
- Question: Which two statements are true about NTP servers in an enterprise network?
  Answer: NTP servers at stratum 1 are directly connected to an authoritative time source, and NTP servers ensure an accurate time stamp on logging and debugging information. NTP is used to synchronize the time across all devices on the network to make sure accurate timestamping on devices for managing, securing and troubleshooting.
- Question: Which firewall feature is used to ensure that packets coming into a network are legitimate responses to requests initiated from internal hosts?
  Answer: Stateful packet inspection. Stateful packet inspection on a firewall checks that incoming packets are actually legitimate responses to requests originating from hosts inside the network.
- Question: What is a function of SNMP?
  Answer: Provides a message format for communication between network device managers and agents. SNMP is an application layer protocol that allows administrators to manage devices on the network by providing a messaging format for communication between network device managers and agents.
- Question: In the data gathering process, which type of device will listen for traffic, but only gather traffic statistics?
  Answer: NetFlow collector. A NetFlow collector is the device that receives traffic statistics from networking devices. NetFlow only gathers traffic statistics, unlike syslog and SNMP which can collect various network events.

# Module 13: Attackers and Their Tools.pdf
- Question: What is the significant characteristic of worm malware?
  Answer: A worm can execute independently of the host system. Worm malware can execute and copy itself without being triggered by a host program. It is a significant network and Internet security threat.
- Question: What are the three major components of a worm attack?
  Answer: A propagation mechanism, an enabling vulnerability, and a payload. A computer can have a worm installed through an email attachment, an executable program file, or a Trojan Horse. The worm attack not only affects one computer, but replicates to other computers. The payload is the code that results in some action.
- Question: What are two common malware behaviors?
  Answer: The computer gets increasingly slower to respond and the computer freezes and requires reboots. Other common symptoms include: appearance of new files/icons, security tools turned off, system crashes, spontaneous emails, missing files, unfamiliar processes running, unknown ports open, or unknown connections.
- Question: What scenario describes a vulnerability broker?
  Answer: A threat actor attempting to discover exploits and report them to vendors, sometimes for prizes or rewards. Vulnerability brokers typically refers to grey hat hackers who attempt to discover exploits and report them to vendors, sometimes for prizes or rewards.
- Question: Which two types of hackers are typically classified as grey hat hackers?
  Answer: Hacktivists and vulnerability brokers. Grey hat hackers may do unethical or illegal things, but not for personal gain or to cause damage. Hacktivists use their hacking as a form of political or social protest, and vulnerability brokers hack to uncover weaknesses and report them to vendors.
- Question: What is the goal of a white hat hacker?
  Answer: Protecting data. White hat hackers are actually "good guys" and are paid by companies and governments to test for security vulnerabilities so that data is better protected.
- Question: A white hat hacker is using a security tool called Skipfish to discover the vulnerabilities of a computer system. What type of tool is this?
  Answer: Fuzzer. Fuzzers are tools used by threat actors when attempting to discover the vulnerabilities of a computer system. Examples of fuzzers include Skipfish, Wapiti, and W3af.
- Question: Why would a rootkit be used by a hacker?
  Answer: To gain access to a device without being detected. Hackers use rootkits to avoid detection as well as hide any software installed by the hacker.
- Question: What are two evasion methods used by hackers?
  Answer: Encryption and resource exhaustion. Methods hackers use to avoid detection include: encryption and tunneling, resource exhaustion, traffic fragmentation, protocol-level misinterpretation, pivot, and rootkit.

# Module 14: Common Threats and Attacks.pdf
- Question: Which two types of attacks are examples of reconnaissance attacks?
  Answer: Port scan and ping sweep. Reconnaissance attacks attempt to gather information about the targets. Ping sweeps will indicate which hosts are up and responding to pings, whereas port scans will indicate on which TCP and UDP ports the target is listening for incoming connections.
- Question: In what type of attack is a cybercriminal attempting to prevent legitimate users from accessing network services?
  Answer: DoS (Denial of Service). In a DoS attack, the goal of the attacker is to prevent legitimate users from accessing network services.
- Question: What are two purposes of launching a reconnaissance attack on a network?
  Answer: To gather information about the network and devices and to scan for accessibility. Gathering information about a network and scanning for access is a reconnaissance attack. Preventing other users from accessing a system is a denial of service attack.
- Question: Which cyber attack involves a coordinated attack from a botnet of zombie computers?
  Answer: DDoS (Distributed Denial of Service). A DDoS attack is launched from multiple coordinated sources. The sources of the attack are zombie hosts that the cybercriminal has built into a botnet. When ready, the cybercriminal instructs the botnet of zombies to attack the chosen target.
- Question: Which type of security threat would be responsible if a spreadsheet add-on disables the local software firewall?
  Answer: Trojan horse. A Trojan horse is software that does something harmful, but is hidden in legitimate software code. A denial of service (DoS) attack results in interruption of network services to users, network devices, or applications.
- Question: Which two characteristics describe a virus?
  Answer: Malicious code that can remain dormant before executing an unwanted action, and malware that relies on the action of a user or a program to activate. A virus is malicious code that is attached to legitimate programs or executable files. Most viruses require end user activation, can lie dormant for an extended period, and then activate at a specific time or date.
- Question: Which two characteristics describe a worm?
  Answer: Is self-replicating and travels to new computers without any intervention or knowledge of the user. Worms are self-replicating pieces of software that consume bandwidth on a network as they propagate from system to system. They do not require a host application, unlike a virus.
- Question: Which attack involves threat actors positioning themselves between a source and destination with the intent of transparently monitoring, capturing, and controlling the communication?
  Answer: Man-in-the-middle attack. The man-in-the-middle attack is a common IP-related attack where threat actors position themselves between a source and destination to transparently monitor, capture, and control the communication.
- Question: Which type of Trojan horse security breach uses the computer of the victim as the source device to launch other attacks?
  Answer: Proxy. The attacker uses a proxy Trojan horse attack to penetrate one device and then use that device to launch attacks on other devices. The Dos Trojan horse slows or halts network traffic. The FTP trojan horse enables unauthorized file transfer services when port 21 has been compromised. A data-sending Trojan horse transmits data back to the hacker that could include passwords.
- Question: What causes a buffer overflow?
  Answer: Attempting to write more data to a memory location than that location can hold. By sending too much data to a specific area of memory, adjacent memory locations are overwritten, which causes a security issue because the program in the overwritten memory location is affected.
- Question: Which type of security attack would attempt a buffer overflow?
  Answer: DoS (Denial of Service). Denial of service (DoS) attacks attempt to disrupt service on the network by either sending a particular device an overwhelming amount of data so no other devices can access the attacked device or by sending malformed packets.
- Question: What are two examples of DoS attacks?
  Answer: Buffer overflow and ping of death. The buffer overflow and ping of death DoS attacks exploit system memory-related flaws on a server by sending an unexpected amount of data or malformed data to the server.
- Question: What technique is a security attack that depletes the pool of IP addresses available for legitimate hosts?
  Answer: DHCP starvation. DHCP starvation attacks create a denial of service for network clients. The attacker sends DHCP discovery messages that contain fake MAC addresses in an attempt to lease all of the IP addresses.
- Question: Which type of network attack involves randomly opening many Telnet requests to a router and results in a valid network administrator not being able to access the device?
  Answer: SYN flooding. The TCP SYN Flood attack exploits the TCP three-way handshake. The threat actor continually sends TCP SYN session request packets with a randomly spoofed source IP address to an intended target.

# Module 15: Network Monitoring and Tools.pdf
- Question: Which functionality is provided by Cisco SPAN in a switched network?
  Answer: It mirrors traffic that passes through a switch port or VLAN to another port for traffic analysis. SPAN is a Cisco technology used by network administrators to monitor suspicious traffic or to capture traffic to be analyzed.
- Question: Which statement describes the function of the SPAN tool used in a Cisco switch?
  Answer: It copies the traffic from one switch port and sends it to another switch port that is connected to a monitoring device. To analyze network traffic passing through a switch, switched port analyzer (SPAN) can be used. SPAN can send a copy of traffic from one port to another port on the same switch where a network analyzer or monitoring device is connected.
- Question: Which statement describes an operational characteristic of NetFlow?
  Answer: NetFlow collects basic information about the packet flow, not the flow data itself. NetFlow does not capture the entire contents of a packet. Instead, NetFlow collects metadata, or data about the flow, not the flow data itself.
- Question: Which two functions are provided by NetFlow?
  Answer: It provides a complete audit trail of basic information about every IP flow forwarded on a device, and it provides 24×7 statistics on packets that flow through a Cisco router or multilayer switch. NetFlow is a Cisco IOS technology that provides statistics and complete audit trails on TCP/IP flows on the network.
- Question: Which technology is a proprietary SIEM system?
  Answer: Splunk. Security Information Event Management (SIEM) is a technology that is used in enterprise organizations to provide real-time reporting and long-term analysis of security events. Splunk is a proprietary SIEM system.
- Question: What are three functionalities provided by SOAR?
  Answer: It automates complex incident response procedures and investigations, it uses artificial intelligence to detect incidents and aid in incident analysis and response, and it provides case management tools that allow cybersecurity personnel to research and investigate incidents. SOAR security platforms gather alarm data, provide research tools, automate complex incident response workflows, and include predefined playbooks.
- Question: Once a cyber threat has been verified, the US Cybersecurity Infrastructure and Security Agency (CISA) automatically shares the cybersecurity information with public and private organizations. What is this automated system called?
  Answer: AIS (Automated Indicator Sharing). CISA use a system called Automated Indicator Sharing (AIS). AIS enables the sharing of attack indicators between the US government and the private sector as soon as threats are verified.

# Module 16: Attacking the Foundation.pdf
- Question: Which field in the IPv6 header points to optional network layer information that is carried in the IPv6 packet?
  Answer: Next header. Optional Layer 3 information about fragmentation, security, and mobility is carried inside of extension headers in an IPv6 packet. The next header field of the IPv6 header acts as a pointer to these optional extension headers if they are present.
- Question: What kind of ICMP message can be used by threat actors to create a man-in-the-middle attack?
  Answer: ICMP redirects. Common ICMP messages of interest to threat actors include: ICMP redirects (used to lure a target host into sending all traffic through a compromised device and create a man-in-the-middle attack), ICMP echo request and echo reply, ICMP unreachable, ICMP mask reply, and ICMP router discovery.

# Module 17: Attacking What We Do.pdf
- Question: Which protocol is exploited by cybercriminals who create malicious iFrames?
  Answer: HTTP. An HTML element known as an inline frame or iFrame allows the browser to load a different web page from another source.
- Question: How can a DNS tunneling attack be mitigated?
  Answer: By using a filter that inspects DNS traffic. To be able to stop DNS tunneling, a filter that inspects DNS traffic must be used. Also, DNS solutions such as Cisco OpenDNS block much of the DNS tunneling traffic by identifying suspicious domains.
- Question: What is the function of a gratuitous ARP sent by a networked device when it boots up?
  Answer: To advise connected devices of its MAC address. A gratuitous ARP is often sent when a device first boots up to inform all other devices on the local network of the MAC address of the new device.
- Question: What is the result of a passive ARP poisoning attack?
  Answer: Confidential information is stolen. ARP poisoning attacks can be passive or active. The result of a passive attack is that cybercriminals steal confidential information. With an active attack, cybercriminals modify data in transit or they inject malicious data.
- Question: What are two methods used by cybercriminals to mask DNS attacks?
  Answer: Domain generation algorithms and fast flux. Fast flux, double IP flux, and domain generation algorithms are used by cybercrimals to attack DNS servers and affect DNS services. Fast flux is a technique used to hide phishing and malware delivery sites behind a quickly-changing network of compromised DNS hosts.
- Question: Which attack involves threat actors positioning themselves between a source and destination with the intent of transparently monitoring, capturing, and controlling the communication?
  Answer: Man-in-the-middle attack. The man-in-the-middle attack is a common IP-related attack where threat actors position themselves between a source and destination to transparently monitor, capture, and control the communication.
- Question: Which type of attack is carried out by threat actors against a network to determine which IP addresses, protocols, and ports are allowed by ACLs?
  Answer: Reconnaissance. Packet filtering ACLs use rules to filter incoming and outgoing traffic. These rules are defined by specifying IP addresses, port numbers, and protocols to be matched. Threat actors can use a reconnaissance attack involving port scanning or penetration testing to determine which IP addresses, protocols, and ports are allowed by ACLs.
- Question: Why would an attacker want to spoof a MAC address?
  Answer: So that a switch on the LAN will start forwarding frames to the attacker instead of to the legitimate host. MAC address spoofing is used to bypass security measures by allowing an attacker to impersonate a legitimate host device, usually for the purpose of collecting network traffic.
- Question: An attacker is redirecting traffic to a false default gateway in an attempt to intercept the data traffic of a switched network. What type of attack could achieve this?
  Answer: DHCP spoofing. In DHCP spoofing attacks, an attacker configures a fake DHCP server on the network to issue DHCP addresses to clients with the aim of forcing the clients to use a false default gateway, and other false services.
- Question: What would be the target of an SQL injection attack?
  Answer: Database. SQL is the language used to query a relational database. Cybercriminals use SQL injections to get information, create fake or malicious queries, or to breach the database in some other way.
- Question: What is a vulnerability that allows criminals to inject scripts into web pages viewed by users?
  Answer: Cross-site scripting. Cross-site scripting (XSS) allows criminals to inject scripts that contain malicious code into web applications.
- Question: A user receives a phone call from a person who claims to represent IT services and then asks that user for confirmation of username and password for auditing purposes. Which security threat does this phone call represent?
  Answer: Social engineering. Social engineering attempts to gain the confidence of an employee and convince that person to divulge confidential and sensitive information, such as usernames and passwords.
- Question: Which devices should be secured to mitigate against MAC address spoofing attacks?
  Answer: Layer 2 devices. Layer 2 attacks such as MAC address spoofing can be mitigated by securing Layer 2 devices.

# Module 18: Understanding Defence.pdf
- Question: Why is asset management a critical function of a growing organization against security threats?
  Answer: It identifies the ever increasing attack surface to threats. Asset management is a critical component of a growing organization from a security aspect. Asset management consists of inventorying all assets, and then developing and implementing policies and procedures to protect them.

- Question: In a defense-in-depth approach, which three options must be identified to effectively defend a network against attacks?
  Answer: Assets that need protection, vulnerabilities in the system, and threats to assets. In order to prepare for a security attack, IT security personnel must identify assets that need to be protected such as servers, routers, access points, and end devices.

- Question: What is the first line of defense when an organization is using a defense-in-depth approach to network security?
  Answer: Edge router. A defense-in-depth approach uses layers of security measures starting at the network edge, working through the network, and finally ending at the network endpoints. Routers at the network edge are the first line of defense.

- Question: What three goals does a BYOD security policy accomplish?
  Answer: Identify which employees can bring their own devices, identify safeguards to put in place if a device is compromised, and describe the rights to access and activities permitted to security personnel on the device.

- Question: Which two options are security best practices that help mitigate BYOD risks?
  Answer: Keep the device OS and software updated, and only allow devices that have been approved by the corporate IT team. Other best practices include: use unique passwords, turn off Wi-Fi and Bluetooth when not used, backup data, use device locator services, provide antivirus software, and use Mobile Device Management software.

- Question: What is the purpose of mobile device management (MDM) software?
  Answer: It is used to implement security policies, setting, and software configurations on mobile devices. MDM software is used with mobile devices so that corporate IT personnel can track the devices, implement security settings, as well as control software configurations.

- Question: What does the incident handling procedures security policy describe?
  Answer: It describes how security incidents are handled.

- Question: What is a characteristic of a layered defense-in-depth security approach?
  Answer: One safeguard failure does not affect the effectiveness of other safeguards. When a layered defense-in-depth security approach is used, layers of security are placed through the organization-at the edge, within the network, and on endpoints.

- Question: What is the benefit of a defense-in-depth approach?
  Answer: The effectiveness of other security measures is not impacted when a security mechanism fails. Network defenses are implemented in layers so that failure of any single security mechanism does not impact other security measures.

- Question: What is a characteristic of the security artichoke, defense-in-depth approach?
  Answer: Each layer has to be penetrated before the threat actor can reach the target data or system. In the security artichoke approach, each layer provides a layer of protection while simultaneously providing a path to attack.

# Module 19: Access Control.pdf
- Question: What is the principle behind the nondiscretionary access control model?
  Answer: It allows access decisions to be based on roles and responsibilities of a user within the organization. The nondiscretionary access control model used the roles and responsibilities of the user as the basis for access decisions.

- Question: Which type of access control applies the strictest access control and is commonly used in military or mission critical applications?
  Answer: Mandatory access control (MAC). MAC is the strictest access control that is typically used in military or mission critical applications.

- Question: Passwords, passphrases, and PINs are examples of which security term?
  Answer: Authentication. Authentication methods are used to strengthen access control systems.

- Question: What is the purpose of the network security accounting function?
  Answer: To keep track of the actions of a user. Authentication, authorization, and accounting are network services collectively known as AAA. Accounting keeps track of the actions of the user.

- Question: Which term describes the ability of a web server to keep a log of the users who access the server, as well as the length of time they use it?
  Answer: Accounting. Accounting records what users do and when they do it, including what is accessed, the amount of time the resource is accessed, and any changes that were made.

- Question: What are two characteristics of the RADIUS protocol?
  Answer: Encryption of the password only and the use of UDP ports for authentication and accounting. RADIUS is an open-standard AAA protocol using UDP port 1645 or 1812 for authentication and UDP port 1646 or 1813 for accounting.

- Question: Which AAA component can be established using token cards?
  Answer: Authentication. The authentication component of AAA is established using username and password combinations, challenge and response questions, and token cards.

- Question: When a security audit is performed at a company, the auditor reports that new users have access to network resources beyond their normal job roles. Additionally, users who move to different positions retain their prior permissions. What kind of violation is occurring?
  Answer: Least privilege. Users should have access to information on a need to know basis. When a user moves from job role to job role, the same concept applies.

- Question: Which component of the zero trust security model focuses on secure access when an API, a microservice, or a container is accessing a database within an application?
  Answer: Workload. The workload pillar focuses on applications that are running in the cloud, in data centers, and other virtualized environments that interact with one another.

- Question: A web server administrator is configuring access settings to require users to authenticate first before accessing certain web pages. Which requirement of information security is addressed through the configuration?
  Answer: Confidentiality. Confidentiality ensures that data is accessed only by authorized individuals. Authentication will help verify the identity of the individuals.

- Question: When designing a prototype network for a new server farm, a network designer chooses to use redundant links to connect to the rest of the network. Which business goal will be addressed by this choice?
  Answer: Availability. Availability is one of the components of information security where authorized users must have uninterrupted access to important resources and data.

# Module 20: Threat Intelligence.pdf
- Question: What is the primary purpose of the Forum of Incident Response and Security Teams (FIRST)?
  Answer: To enable a variety of computer security incident response teams to collaborate, cooperate, and coordinate information sharing, incident prevention, and rapid reaction strategies. FIRST enables collaboration between various computer security incident response teams.

- Question: What is the primary purpose of the Malware Information Sharing Platform (MISP)?
  Answer: To enable automated sharing of IOCs between people and machines using the STIX and other exports formats. MISP is an open source platform that enables automated sharing of Indicators of Compromise.

- Question: Which statement describes Trusted Automated Exchange of Indicator Information (TAXII)?
  Answer: It is the specification for an application layer protocol that allows the communication of CTI over HTTPS. TAXII is designed to support Structured Threat Information Expression (STIX).

- Question: Which organization defines unique CVE Identifiers for publicly known information-security vulnerabilities that make it easier to share data?
  Answer: MITRE. The United States government sponsored the MITRE Corporation to create and maintain a catalog of known security threats called Common Vulnerabilities and Exposures (CVE).

- Question: How does FireEye detect and prevent zero-day attacks?
  Answer: By addressing all stages of an attack lifecycle with a signature-less engine utilizing stateful attack analysis. FireEye uses a three-pronged approach combining security intelligence, security expertise, and technology.

- Question: What is the primary function of the Center for Internet Security (CIS)?
  Answer: To offer 24×7 cyberthreat warnings and advisories, vulnerability identification, and mitigation and incident responses. CIS offers these services to state, local, tribal, and territorial governments through the Multi-State Information Sharing and Analysis Center.

- Question: What is CybOX?
  Answer: It is a set of standardized schemata for specifying, capturing, characterizing, and communicating events and properties of network operations. CybOX is a set of open standards that provide the specifications that aid in the automated exchange of cyberthreat intelligence information.

- Question: How does AIS address a newly discovered threat?
  Answer: By enabling real-time exchange of cyberthreat indicators with U.S. Federal Government and the private sector. AIS responds to a new threat as soon as it is recognized by immediately sharing it to help protect networks against that particular threat.

  # Module 21: Cryptography.pdf
- Question: What are the four elements of securing communications mentioned in this module?
  Answer: Data Integrity, Origin Authentication, Data Confidentiality, and Data Non-Repudiation.
- Question: What does data integrity guarantee?
  Answer: That the message was not altered.
- Question: What does origin authentication guarantee?
  Answer: That the message is not a forgery and comes from whom it states.
- Question: What does data confidentiality guarantee?
  Answer: That only authorised users can read the message.
- Question: What does data non-repudiation guarantee?
  Answer: That the sender cannot deny the validity of a sent message.
- Question: What is a digital signature used for?
  Answer: To provide authenticity, integrity, and non-repudiation of digital documents.
- Question: What are some applications of cryptography mentioned?
  Answer: Implementing two-factor authentication, securing USB storage devices, and encrypted network transactions like HTTPS.
- Question: What are some potential security issues related to SSL/TLS?
  Answer: Introduction of regulatory compliance violations, viruses, malware, data loss, and intrusion attempts.
- Question: What is a Public Key Infrastructure (PKI) used for?
  Answer: To create, manage, distribute, use, store, and revoke digital certificates.
- Question: Can you name some common uses of PKIs?
  Answer: SSL/TLS certificate-based peer authentication, HTTPS Web traffic, secure instant messaging, and securing USB storage devices.

# Module 22: Endpoint Protection.pdf
- Question: What is the main objective of the "Endpoint Protection" module?
  Answer: The main objective is to explain how a malware analysis website generates a malware analysis report.
- Question: What are endpoints defined as in network security?
  Answer: Hosts on the network that can access or be accessed by other hosts.
- Question: What are the two internal LAN elements that need to be secured?
  Answer: Endpoints and Network Infrastructure.
- Question: What is the purpose of Antivirus/Antimalware Software?
  Answer: To detect and mitigate viruses and malware installed on a host.
- Question: What is a host-based firewall?
  Answer: Software that runs on an individual computer to control network traffic entering and leaving the system based on predefined policies or profiles.
- Question: Can you name some examples of host-based firewalls?
  Answer: Windows Defender Firewall, iptables, nftables, and TCP Wrappers.
- Question: What is a Host-based Intrusion Detection System (HIDS) designed to protect against?
  Answer: Known and unknown malware on individual hosts.
- Question: What is an attack surface in the context of endpoint protection?
  Answer: The total sum of the vulnerabilities in a given system that is accessible to an attacker.
- Question: What is an application blacklist?
  Answer: A list that dictates which user applications are not permitted to run on a computer.
- Question: What is an application whitelist?
  Answer: A list that specifies which programs are allowed to run on a computer.
- Question: How do network-based malware prevention devices enhance protection?
  Answer: They are capable of sharing information among themselves to make better-informed decisions.

# Module 23: Endpoint Vulnerability Assessment.pdf
- Question: What is the main objective of the "Endpoint Vulnerability Assessment" module?
  Answer: The main objective is to explain how endpoint vulnerabilities are assessed and managed.
- Question: What is the value of network and server profiling?
  Answer: Provides statistical baseline information that can serve as a reference point for normal network and device performance.
- Question: What is the Common Vulnerability Scoring System (CVSS)?
  Answer: A vendor-neutral, industry standard that provides standardised vulnerability scores reflecting their severity.
- Question: What are some activities involved in vulnerability testing?
  Answer: Risk analysis, vulnerability assessment, and penetration testing.
- Question: What is the difference between vulnerability assessment and penetration testing as described?
  Answer: Vulnerability assessment is typically a passive activity involving scans for known vulnerabilities, while penetration testing involves actively attempting to exploit vulnerabilities.
- Question: What are some tools used for vulnerability assessment?
  Answer: OpenVas, Microsoft Baseline Analyser, Nessus, and Qualys.
- Question: What are the three metric groups in the CVSS base metric group?
  Answer: Exploitability metrics, Scope metric, and Impact metrics.
- Question: What are the criteria included in the Impact metrics of CVSS?
  Answer: Confidentiality Impact, Integrity Impact, and Availability Impact.
- Question: What are the CVSS severity ratings and their corresponding score ranges?
  Answer: None (0), Low (0.1 -- 3.9), Medium (4.0 -- 6.9), High (7.0 -- 8.9), Critical (9.0 -- 10.0).
- Question: How is the CVE database used in vulnerability management?
  Answer: It provides a standard way to research and reference known vulnerabilities.
- Question: What are the steps in the Vulnerability Management Life Cycle?
  Answer: Discover, Prioritise Assets, Assess, Report, Remediate, Verify.
- Question: What are some ways to respond to identified risks?
  Answer: Risk avoidance, risk reduction, risk sharing, and risk retention.
- Question: What is asset management focused on in the context of vulnerability assessment?
  Answer: Tracking the location and configuration of networked devices and software across an enterprise.
- Question: What is an Information Security Management System (ISMS)?
  Answer: A systematic approach to managing sensitive company information to maintain its security.
- Question: What is ISO-27001?
  Answer: A global, industry-wide specification for an ISMS, part of the ISO/IEC 27000 family of standards.
- Question: What is the Deming cycle (PDCA), and how is it related to ISMS?
  Answer: The Plan-Do-Check-Act cycle used for continuous improvement, often incorporated into ISMS frameworks.

# Module 24: Technologies and Protocols.pdf
- Question: What is the main objective of the "Technologies and Protocols" module?
  Answer: The main objective is to explain how security technologies affect security monitoring.
- Question: How can DNS be used for command and control (CnC) by malware?
  Answer: Malware can use DNS requests with encoded data in the subdomain to communicate with a CnC server.
- Question: What might indicate suspicious DNS activity related to CnC?
  Answer: Subdomain parts of DNS requests that are much longer than usual requests.
- Question: How can threat actors use email protocols for malicious purposes?
  Answer: To spread malware, exfiltrate data, or provide channels to malware CnC servers.
- Question: What are some ways ICMP can be used maliciously?
  Answer: To identify hosts and network structure, determine operating systems, and as a vehicle for DoS attacks and data exfiltration.
- Question: How can attackers learn about Access Control Lists (ACLs)?
  Answer: By port scanning, penetration testing, or other forms of reconnaissance.
- Question: How can Network Address Translation (NAT) and Port Address Translation (PAT) complicate security monitoring?
  Answer: They can obscure the internal source of network traffic and make it harder to track individual user activity, especially with unidirectional data like NetFlow.
- Question: What is load balancing used for?
  Answer: To distribute network traffic across multiple devices or network paths to prevent overwhelming network resources.
- Question: How can load balancing affect security monitoring?
  Answer: A single internet transaction might be represented by multiple IP addresses on incoming packets, potentially appearing suspicious. Also, load balancing managers might send probes that appear as network activity.
- Question: How can DNS be used in load balancing?
  Answer: By sending traffic to resources with the same domain name but multiple IP addresses.

# Module 25: Network Security Data.pdf
- Question: What is the main objective of the "Network Security Data" module?
  Answer: The main objective is to explain the types of network security data used in security monitoring.
- Question: What are full packet captures, and what type of information do they contain?
  Answer: The most detailed network data collected, containing the actual content of conversations like email text, web page HTML, and transferred files.
- Question: What type of data can be recovered and analysed from full packet captures?
  Answer: Extracted content can be analysed for malware or user behaviour that violates policies.
- Question: What information is typically contained in session data or access logs?
  Answer: Details about network transactions during sessions, including requests and replies.
- Question: How is statistical data created in network security monitoring?
  Answer: Through the analysis of various forms of network data.
- Question: What are end device logs?
  Answer: Logs generated by individual computers and other endpoint devices, recording events happening on those devices.
- Question: What is SIEM (Security Information and Event Management)?
  Answer: A system that aggregates and analyses security event data from various sources to aid in threat detection and response.
- Question: What are some key functions of a SIEM system?
  Answer: Collection, Aggregation, Normalisation, Correlation, Reporting, and Compliance.
- Question: What are network logs?
  Answer: Logs generated by network devices like routers, switches, and firewalls, recording network activity and events.
- Question: What is Application Visibility and Control (AVC), and what technology does Cisco use for it?
  Answer: AVC is the ability to identify and control applications using Layer 3 to Layer 7 data. Cisco uses Next-Generation NBAR (NBAR2) for application recognition.
- Question: What is the purpose of web proxy logs?
  Answer: To record all requests and responses handled by the proxy server, allowing analysis of requested destinations and downloaded resources.
- Question: What is a Next-Generation Firewall (NGFW)?
  Answer: Firewall devices that extend security beyond IP addresses and port numbers to the application layer and beyond, often consolidating multiple security functions.
- Question: What are some common events logged by an NGFW?
  Answer: Connection Event, Intrusion Event, Host or Endpoint Event, Network Discovery Event, and NetFlow Event.
- Question: What is NetFlow, and what type of data does it provide?
  Answer: A Cisco technology that provides flow-based network traffic data, useful for monitoring traffic patterns and network behaviour.
- Question: What specifications does Syslog include?
  Answer: Specifications for message formats and a client-server application structure.

# Module 26: Evaluating Alerts.pdf
- Question: What is the main objective of the "Evaluating Alerts" module?
  Answer: The main objective is to explain the process of evaluating alerts.
- Question: What are security alerts?
  Answer: Notification messages generated by NSM tools, systems, and security devices when potentially malicious activity is detected.
- Question: What is Security Onion?
  Answer: A Linux distro for threat hunting, enterprise security monitoring, and log management, integrating various open-source security tools.
- Question: Name some of the detection tools included in Security Onion.
  Answer: CapME, Snort, Sguil, Zeek (Bro), Kibana, and Wireshark.
- Question: What is Sguil in Security Onion?
  Answer: A console that integrates alerts from multiple sources into a single interface for investigation.
- Question: What are some of the fields typically available for real-time events in the Sguil interface?
  Answer: ST (Status), CNT (Count), Sensor, Alert ID, Date/Time, and Event Message.
- Question: What does the CNT field in Sguil indicate?
  Answer: The count for the number of times a particular event has been detected for the same source and destination IP address, indicating correlation.
- Question: What does the Event Message field in Sguil contain?
  Answer: The identifying text for the event, configured in the rule that triggered the alert.
- Question: What is the purpose of the Analyst Workflow in security operations?
  Answer: To provide a standardised and efficient process for handling security alerts and incidents.
- Question: What are the four categories used to classify alerts based on validity and intent?
  Answer: True Positive, True Negative, False Positive, and False Negative.
- Question: What is a True Positive alert?
  Answer: An alert that correctly identifies malicious activity.
- Question: What is a False Positive alert?
  Answer: An alert that incorrectly identifies legitimate activity as malicious.
- Question: What is Snort?
  Answer: A widely used Network Intrusion Detection System (NIDS) and an important source of alert data for Sguil.
- Question: What is Zeek (formerly Bro)?
  Answer: A network traffic analyser that serves as a security monitor, providing detailed transaction logs.
- Question: What is Kibana used for in the context of Security Onion?
  Answer: An interactive dashboard interface to Elasticsearch data, allowing for visualisation and analysis of logs and events.

# Module 27: Working with Network Security Data.pdf
- Question: What is the main objective of the "Working with Network Security Data" module?
  Answer: The main objective is to interpret data to determine the source of an alert.
- Question: What is a Network Security Monitoring (NSM) system used for?
  Answer: For collecting and analysing network data to detect and respond to security incidents.
- Question: What is ELK (Elasticsearch, Logstash, Kibana) or the Elastic Stack?
  Answer: A popular network security monitoring platform used to unite data for analysis.
- Question: What are the roles of Elasticsearch, Logstash, and Kibana in the ELK stack?
  Answer: Elasticsearch: A platform for searching and analysing data in near real time. Logstash: Enables collection and normalisation of network data into Elasticsearch indexes. Kibana: Provides a visualisation layer for data stored in Elasticsearch.
- Question: What are Beats in the Elastic Stack?
  Answer: A series of software plugins that send different types of data to Elasticsearch.
- Question: Why is data reduction important for an NSM system?
  Answer: To reduce the volume of event data, ensuring that only relevant data is processed and reducing the burden on systems like Elasticsearch.
- Question: What is data normalisation?
  Answer: The process of combining data from multiple sources into a common format with a specified schema for data fields.
- Question: Why is data normalisation important for security analysis?
  Answer: To simplify searching for correlated events from different data sources that might use varying formats.
- Question: How can you construct queries in Sguil?
  Answer: Using the Query Builder or by directly inputting queries, requiring knowledge of field names and values.
- Question: What does pivoting from Sguil allow a cybersecurity analyst to do?
  Answer: Access other information sources and tools such as log files in Elasticsearch or relevant packet captures in Wireshark.
- Question: How is log data typically organised in Elasticsearch?
  Answer: Into separate indices or databases based on a configured range of time.
- Question: What is Query Domain Specific Language (DSL) in Elasticsearch?
  Answer: Elasticsearch's own query language based on JSON, built on Apache Lucene.
- Question: What are some elements used in Elasticsearch queries?
  Answer: Boolean operators, Fields, Ranges, Wildcards, Regex, Fuzzy Search, and Text Search.
- Question: Besides looking at logs, what else is important for understanding network transactions at a deeper level?
  Answer: Analysing traffic at the packet level, often involving capturing and examining pcap files.
- Question: What are some capabilities that enhance the efficiency of a cyberoperations team in managing alerts?
  Answer: Using a structured analyst workflow and implementing automated queries.

# Module 28: Digital Forensics and Incident Analysis and Response.pdf
- Question: What is the main objective of the "Digital Forensics and Incident Analysis and Response" module?
  Answer: The main objective is to explain how the CyberOps Associate responds to cyber security incidents.
- Question: What is the role of digital forensics processes in incident response?
  Answer: To identify, preserve, collect, examine, analyse, and report on digital evidence.
- Question: What are the steps in the Cyber Kill Chain?
  Answer: Reconnaissance, Weaponisation, Delivery, Exploitation, Installation, Command and Control, Actions on Objectives.
- Question: What are the four steps in the forensic process?
  Answer: Collection, Examination, Analysis, and Reporting.
- Question: What are the broad classifications of evidence in legal proceedings mentioned?
  Answer: Direct Evidence, Indirect evidence (Circumstantial), Best evidence, and Corroborating evidence.
- Question: What is the principle behind the evidence collection order (based on IETF RFC 3227)?
  Answer: To collect evidence starting with the most volatile data (e.g., RAM) and proceeding to the least volatile.
- Question: What is chain of custody, and why is it important?
  Answer: The documented and unbroken chronological history of who had control of evidence, essential for maintaining its admissibility in legal proceedings.
- Question: What is threat attribution?
  Answer: The act of determining the individual, organisation, or nation responsible for a successful intrusion or attack incident.
- Question: What are Tactics, Techniques, and Procedures (TTPs) in the context of threat attribution?
  Answer: Tactics: High-level strategic goals of the adversary. Techniques: The means by which tactics are accomplished. Procedures: The specific actions taken by threat actors in the identified techniques.
- Question: What is the MITRE ATT&CK Framework?
  Answer: A global knowledge base of threat actor behaviour, designed to enable automated information sharing.
- Question: What is the Diamond Model of Intrusion Analysis?
  Answer: A framework for understanding and analysing intrusion events by considering adversary, capability, infrastructure, and victim.
- Question: What is the aim of incident response?
  Answer: To limit the impact of an attack, assess the damage caused, and implement recovery procedures.
- Question: What are some key elements of an incident response policy?
  Answer: Statement of management commitment, purpose and objectives, scope, definition of incidents, and organisational structure.
- Question: Who are some of the stakeholders typically involved in handling a security incident?
  Answer: Management, Information Assurance, IT Support, Legal Department, Public Affairs, HR, Business Continuity Planners, and Physical Security.
- Question: What are the four steps in the NIST Incident Response Life Cycle?
  Answer: Preparation, Detection and Analysis, Containment, Eradication, Recovery, Lessons Learned.
- Question: What happens during the Preparation phase of the NIST Incident Response Life Cycle?
  Answer: Establishing an incident response team, training members, creating facilities, conducting risk assessments, developing training materials, and acquiring necessary tools.
- Question: What are some common attack vectors?
  Answer: Web, Email, Loss or Theft, Impersonation, Attrition, and Media.
- Question: What are some sources for incident detection?
  Answer: Automated detection (antivirus, IDS) and manual detection (user reports).
- Question: What is involved in the Containment phase of incident response?
  Answer: Limiting the scope and impact of the incident.
- Question: What are some determining factors for evidence retention?
  Answer: Prosecution needs, data type requirements, and cost of storage.
- Question: Why is reporting important in incident response?
  Answer: To inform relevant stakeholders, including management and potentially regulatory bodies, about the incident and the response.`
export default flashcardsData
// This data is structured as an array of objects, where each object represents a flashcard with a question and answer.
