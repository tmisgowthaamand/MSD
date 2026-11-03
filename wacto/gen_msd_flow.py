#!/usr/bin/env python3
"""
Generator for Maha Seva Dal (MSD) WACTO WhatsApp Chatbot Flow v1 (English).
Strictly complies with wacto-flow SKILL.md rules and golden_working_flow_v9e patterns.
Features:
- Exactly mirrors the 4-step Web Registration Sequence:
    Step 1: Personal Profile & Compulsory Emergency Contact (Screenshot 1)
    Step 2: Location & Residential Address (Screenshot 2)
    Step 3: Profession & Wing Choice (Screenshot 3 - Wings are inside this step)
    Step 4: Mandatory Passport-Size Photo Upload (compulsory, kept last before review)
    Step 5: Review & 1947 Oath of Service Pledge (Screenshot 4)
- Main Menu row changed from 'Join Maha Seva Dal' to 'Cadre Registration'.
- Clean 6-item Main Menu: Cadre Registration, My Cadre ID Card, Our Seva Wings, History & Ideology, Our Official Website, Donate & Support.
- Zero 80G tax or PAN friction on WhatsApp; delivers instant Donation Payment Invoice.
"""
import json, uuid, os, sys

def gen_id():
    return str(uuid.uuid4())

def build_msd_flow():
    nodes = []
    edges = []

    # Map to track edge keywords to guarantee single-destination routing
    keyword_dests = {}

    def add_edge(from_id, to_id, keyword, intent_name=None, delay=0, source_handle=None):
        if intent_name is None:
            intent_name = keyword
        edge = {
            "fromNodeId": from_id,
            "toNodeId": to_id,
            "keywords": [keyword],
            "intentName": intent_name,
            "delay": delay
        }
        if source_handle:
            edge["sourceHandle"] = source_handle
        edges.append(edge)
        keyword_dests.setdefault(keyword, set()).add(to_id)
        return edge

    # -------------------------------------------------------------
    # 1. ROOT NODE (LIST MESSAGE - 6 ITEMS)
    # -------------------------------------------------------------
    root_rows_defs = [
        ("Cadre Registration", "New volunteer cadre enrollment & registration"),
        ("My Cadre ID Card", "Check approval status & get Digital ID Card"),
        ("History & Ideology", "Estd. 1947 · Unity of People & Sardar Patel"),
        ("Our Official Website", "Visit mahasevadal.com & digital portals"),
        ("Donate & Support", "Official UPI QR & Donation Payment Invoice")
    ]

    root_rows = []
    root_row_ids = {}
    for title, desc in root_rows_defs:
        rid = gen_id()
        root_row_ids[title] = rid
        root_rows.append({"id": rid, "title": title, "description": desc})

    root_node = {
        "nodeId": "root",
        "type": "interactive",
        "name": "Maha Seva Dal Official Menu",
        "interactiveId": None,
        "keywords": [
            "Hi", "Hello", "Hey", "Start", "Menu",
            "hi", "hello", "hey", "start", "menu", "MSD", "msd"
        ],
        "parentNodeId": None,
        "data": {
            "interactiveType": "list",
            "header": {"type": "text", "text": "Maha Seva Dal"},
            "body": "Welcome to Maha Seva Dal (Unity of People's).\nEstd. 1947 · National Socio-Cultural Cadre Registry.\n\nDedicated to constitutional unity, community seva, healthcare, child welfare, and civic empowerment.\n\nPlease choose an option below to continue:",
            "footer": "Select an option below",
            "action": {
                "button": "Choose Service",
                "sections": [
                    {
                        "title": "Cadre Services & Portal",
                        "rows": root_rows
                    }
                ]
            }
        }
    }
    nodes.append(root_node)

    # -------------------------------------------------------------
    # 2. STEP 1: PERSONAL & CONTACT PROFILE (MIRRORS WEB STEP 1)
    # -------------------------------------------------------------
    profile_node_id = gen_id()
    btn_fill_profile_id = gen_id()
    btn_proceed_loc_id = gen_id()
    btn_profile_menu_id = gen_id()

    profile_node = {
        "nodeId": profile_node_id,
        "type": "interactive",
        "name": "Register: Personal Profile",
        "interactiveId": root_row_ids["Cadre Registration"],
        "keywords": ["Cadre Registration"],
        "parentNodeId": "root",
        "data": {
            "interactiveType": "button",
            "header": {"type": "text", "text": "1. Personal Profile"},
            "body": "👤 Step 1 of 4: Personal & Contact Profile\nProvide official legal name and contact details as registered in identification documents:\n\n• Full Legal Name\n• Father's / Husband's Name\n• Date of Birth & Gender\n• Primary Mobile Number & WhatsApp\n• Email Address (Optional)\n• Blood Group (Optional: recommended for emergency use)\n\n🚨 Emergency Contact Details (Compulsory):\n• Emergency Contact Number\n• Relationship with Member (Mother / Father / Spouse)\n\nTap 'Fill Profile Form' to enter manual details or 'Proceed to Address' to continue:",
            "footer": "Maha Seva Dal Foundation",
            "action": {
                "buttons": [
                    {"type": "reply", "reply": {"id": btn_fill_profile_id, "title": "Fill Profile Form"}},
                    {"type": "reply", "reply": {"id": btn_proceed_loc_id, "title": "Proceed to Address"}},
                    {"type": "reply", "reply": {"id": btn_profile_menu_id, "title": "Main Menu"}}
                ]
            }
        }
    }
    nodes.append(profile_node)

    # Sub-node: Manual Entry Prompt
    fill_prompt_node_id = gen_id()
    btn_prompt_addr_id = gen_id()
    btn_prompt_menu_id = gen_id()
    fill_prompt_node = {
        "nodeId": fill_prompt_node_id,
        "type": "interactive",
        "name": "Register: Manual Profile Entry",
        "interactiveId": btn_fill_profile_id,
        "keywords": ["Fill Profile Form"],
        "parentNodeId": profile_node_id,
        "data": {
            "interactiveType": "button",
            "header": {"type": "text", "text": "📝 Manual Profile Entry"},
            "body": "Please enter your manual profile details in the chat or use the interactive form:\n\n1. Full Legal Name\n2. Father's / Husband's Name\n3. Date of Birth & Gender\n4. Primary Mobile & WhatsApp\n5. Compulsory Emergency Contact & Relationship\n\nTap 'Proceed to Address' when done:",
            "footer": "Maha Seva Dal Foundation",
            "action": {
                "buttons": [
                    {"type": "reply", "reply": {"id": btn_prompt_addr_id, "title": "Proceed to Address"}},
                    {"type": "reply", "reply": {"id": btn_prompt_menu_id, "title": "Main Menu"}}
                ]
            }
        }
    }
    nodes.append(fill_prompt_node)

    # Connect Root Menu -> Step 1 Personal Profile
    add_edge("root", profile_node_id, "Cadre Registration", source_handle=root_row_ids["Cadre Registration"])
    add_edge(profile_node_id, fill_prompt_node_id, "Fill Profile Form", source_handle=btn_fill_profile_id)
    add_edge(profile_node_id, "root", "Main Menu", source_handle=btn_profile_menu_id)
    add_edge(fill_prompt_node_id, "root", "Main Menu", source_handle=btn_prompt_menu_id)

    # -------------------------------------------------------------
    # 3. STEP 2: LOCATION & RESIDENTIAL ADDRESS (ALL 36 PAN-INDIA STATES A–Z)
    # -------------------------------------------------------------
    state_p1_id = gen_id()
    state_p2_id = gen_id()
    state_p3_id = gen_id()
    state_p4_id = gen_id()

    # Page 1: A – D (9 states + pagination)
    states_p1_def = [
        ("Andaman and Nicobar", "Union Territory"),
        ("Andhra Pradesh", "Pradesh Unit"),
        ("Arunachal Pradesh", "Pradesh Unit"),
        ("Assam", "Pradesh Unit"),
        ("Bihar", "Pradesh Unit"),
        ("Chandigarh", "Union Territory"),
        ("Chhattisgarh", "Pradesh Unit"),
        ("Dadra & Nagar Haveli", "Union Territory"),
        ("Delhi", "National Capital Territory"),
    ]
    # Page 2: G – L (9 states + pagination)
    states_p2_def = [
        ("Goa", "Pradesh Unit"),
        ("Gujarat", "Pradesh Unit"),
        ("Haryana", "Pradesh Unit"),
        ("Himachal Pradesh", "Pradesh Unit"),
        ("Jammu & Kashmir", "Union Territory"),
        ("Jharkhand", "Pradesh Unit"),
        ("Karnataka", "Pradesh Unit (31 Districts)"),
        ("Kerala", "Pradesh Unit (14 Districts)"),
        ("Ladakh", "Union Territory"),
    ]
    # Page 3: L – P (9 states + pagination)
    states_p3_def = [
        ("Lakshadweep", "Union Territory"),
        ("Madhya Pradesh", "Pradesh Unit"),
        ("Maharashtra", "Pradesh Unit (36 Districts)"),
        ("Manipur", "Pradesh Unit"),
        ("Meghalaya", "Pradesh Unit"),
        ("Mizoram", "Pradesh Unit"),
        ("Nagaland", "Pradesh Unit"),
        ("Odisha", "Pradesh Unit"),
        ("Puducherry", "Union Territory"),
    ]
    # Page 4: P – W (9 states)
    states_p4_def = [
        ("Punjab", "Pradesh Unit"),
        ("Rajasthan", "Pradesh Unit"),
        ("Sikkim", "Pradesh Unit"),
        ("Tamil Nadu", "Pradesh Unit (38 Districts)"),
        ("Telangana", "Pradesh Unit"),
        ("Tripura", "Pradesh Unit"),
        ("Uttar Pradesh", "Pradesh Unit (75 Districts)"),
        ("Uttarakhand", "Pradesh Unit"),
        ("West Bengal", "Pradesh Unit"),
    ]

    all_state_defs = states_p1_def + states_p2_def + states_p3_def + states_p4_def
    state_row_ids = {title: gen_id() for title, _ in all_state_defs}
    more_states_p2_id = gen_id()
    more_states_p3_id = gen_id()
    more_states_p4_id = gen_id()

    # State Page 1
    state_p1_rows = [
        {"id": state_row_ids[title], "title": title, "description": desc}
        for title, desc in states_p1_def
    ] + [{"id": more_states_p2_id, "title": "More States (2/4) →", "description": "Goa to Ladakh (G–L)"}]

    nodes.append({
        "nodeId": state_p1_id,
        "type": "interactive",
        "name": "Select State — Page 1/4 (A–D)",
        "interactiveId": btn_proceed_loc_id,
        "keywords": ["Proceed to Address"],
        "parentNodeId": profile_node_id,
        "data": {
            "interactiveType": "list",
            "header": {"type": "text", "text": "Select State (A–D)"},
            "body": "📍 Step 2 of 4: Location & Residential Address\nSelect your State / UT in Alphabetical Order (Page 1/4: A–D):\n\nYour state determines your Pradesh Cadre Committee.",
            "footer": "Maha Seva Dal · Pan-India (1/4)",
            "action": {
                "button": "Choose State (A–D)",
                "sections": [{"title": "States & UTs (A–D)", "rows": state_p1_rows}]
            }
        }
    })

    # State Page 2
    state_p2_rows = [
        {"id": state_row_ids[title], "title": title, "description": desc}
        for title, desc in states_p2_def
    ] + [{"id": more_states_p3_id, "title": "More States (3/4) →", "description": "Lakshadweep to Puducherry (L–P)"}]

    nodes.append({
        "nodeId": state_p2_id,
        "type": "interactive",
        "name": "Select State — Page 2/4 (G–L)",
        "interactiveId": more_states_p2_id,
        "keywords": ["More States (2/4) →"],
        "parentNodeId": state_p1_id,
        "data": {
            "interactiveType": "list",
            "header": {"type": "text", "text": "Select State (G–L)"},
            "body": "Select your State / UT in Alphabetical Order (Page 2/4: G–L):\n\nYour state determines your Pradesh Cadre Committee.",
            "footer": "Maha Seva Dal · Pan-India (2/4)",
            "action": {
                "button": "Choose State (G–L)",
                "sections": [{"title": "States & UTs (G–L)", "rows": state_p2_rows}]
            }
        }
    })

    # State Page 3
    state_p3_rows = [
        {"id": state_row_ids[title], "title": title, "description": desc}
        for title, desc in states_p3_def
    ] + [{"id": more_states_p4_id, "title": "More States (4/4) →", "description": "Punjab to West Bengal (P–W)"}]

    nodes.append({
        "nodeId": state_p3_id,
        "type": "interactive",
        "name": "Select State — Page 3/4 (L–P)",
        "interactiveId": more_states_p3_id,
        "keywords": ["More States (3/4) →"],
        "parentNodeId": state_p2_id,
        "data": {
            "interactiveType": "list",
            "header": {"type": "text", "text": "Select State (L–P)"},
            "body": "Select your State / UT in Alphabetical Order (Page 3/4: L–P):\n\nYour state determines your Pradesh Cadre Committee.",
            "footer": "Maha Seva Dal · Pan-India (3/4)",
            "action": {
                "button": "Choose State (L–P)",
                "sections": [{"title": "States & UTs (L–P)", "rows": state_p3_rows}]
            }
        }
    })

    # State Page 4
    state_p4_rows = [
        {"id": state_row_ids[title], "title": title, "description": desc}
        for title, desc in states_p4_def
    ]

    nodes.append({
        "nodeId": state_p4_id,
        "type": "interactive",
        "name": "Select State — Page 4/4 (P–W)",
        "interactiveId": more_states_p4_id,
        "keywords": ["More States (4/4) →"],
        "parentNodeId": state_p3_id,
        "data": {
            "interactiveType": "list",
            "header": {"type": "text", "text": "Select State (P–W)"},
            "body": "Select your State / UT in Alphabetical Order (Page 4/4: P–W):\n\nYour state determines your Pradesh Cadre Committee.",
            "footer": "Maha Seva Dal · Pan-India (4/4)",
            "action": {
                "button": "Choose State (P–W)",
                "sections": [{"title": "States & UTs (P–W)", "rows": state_p4_rows}]
            }
        }
    })

    # State Paging Edges
    add_edge(profile_node_id, state_p1_id, "Proceed to Address", source_handle=btn_proceed_loc_id)
    add_edge(fill_prompt_node_id, state_p1_id, "Proceed to Address", source_handle=btn_prompt_addr_id)
    add_edge(state_p1_id, state_p2_id, "More States (2/4) →", source_handle=more_states_p2_id)
    add_edge(state_p2_id, state_p3_id, "More States (3/4) →", source_handle=more_states_p3_id)
    add_edge(state_p3_id, state_p4_id, "More States (4/4) →", source_handle=more_states_p4_id)

    # Tamil Nadu Districts (5 Pages)
    districts_p1 = [
        "Ariyalur District", "Chengalpattu District", "Chennai District",
        "Coimbatore District", "Cuddalore District", "Dharmapuri District",
        "Dindigul District", "Erode District", "Kallakurichi District"
    ]
    districts_p2 = [
        "Kanchipuram District", "Kanyakumari District", "Karur District",
        "Krishnagiri District", "Madurai District", "Mayiladuthurai District",
        "Nagapattinam District", "Namakkal District", "Nilgiris District"
    ]
    districts_p3 = [
        "Perambalur District", "Pudukkottai District", "Ramanathapuram District",
        "Ranipet District", "Salem District", "Sivaganga District",
        "Tenkasi District", "Thanjavur District", "Theni District"
    ]
    districts_p4 = [
        "Thoothukudi District", "Tiruchirappalli District", "Tirunelveli District",
        "Tirupathur District", "Tiruppur District", "Tiruvallur District",
        "Tiruvannamalai District", "Tiruvarur District"
    ]
    districts_p5 = [
        "Vellore District", "Viluppuram District", "Virudhunagar District"
    ]

    dist_p1_id = gen_id()
    dist_p2_id = gen_id()
    dist_p3_id = gen_id()
    dist_p4_id = gen_id()
    dist_p5_id = gen_id()

    # Tamil Nadu links from Page 4 to Tamil Nadu District Page 1
    add_edge(state_p4_id, dist_p1_id, "Tamil Nadu", source_handle=state_row_ids["Tamil Nadu"])

    # Karnataka Districts Node (Sorted Alphabetically A–Z)
    dist_karnataka_id = gen_id()
    karnataka_districts = [
        "Bagalkot District", "Ballari District", "Belagavi District",
        "Bengaluru Rural Dist", "Bengaluru Urban Dist", "Bidar District",
        "Kalaburagi District", "Mysuru District", "Tumakuru District",
        "Other Karnataka Dist"
    ]
    karnataka_dist_ids = {dist: gen_id() for dist in karnataka_districts}
    karnataka_node = {
        "nodeId": dist_karnataka_id,
        "type": "interactive",
        "name": "Select District — Karnataka",
        "interactiveId": state_row_ids["Karnataka"],
        "keywords": ["Karnataka"],
        "parentNodeId": state_p2_id,
        "data": {
            "interactiveType": "list",
            "header": {"type": "text", "text": "Karnataka Districts (A–Z)"},
            "body": "Select your District Unit in Karnataka Pradesh (A–Z):\nYour district determines your local cadre unit and seva coordination.",
            "footer": "Maha Seva Dal Karnataka",
            "action": {
                "button": "Choose District",
                "sections": [
                    {
                        "title": "Karnataka Districts A–Z",
                        "rows": [
                            {"id": karnataka_dist_ids[d], "title": d, "description": "Karnataka Cadre Unit"}
                            for d in karnataka_districts
                        ]
                    }
                ]
            }
        }
    }
    nodes.append(karnataka_node)
    add_edge(state_p2_id, dist_karnataka_id, "Karnataka", source_handle=state_row_ids["Karnataka"])

    # Address & PIN Code Confirmation Node
    addr_details_id = gen_id()
    btn_to_wings_id = gen_id()
    btn_chg_dist_id = gen_id()
    btn_addr_menu_id = gen_id()

    addr_details_node = {
        "nodeId": addr_details_id,
        "type": "interactive",
        "name": "Register: Address & PIN",
        "interactiveId": None,
        "keywords": ["District Unit Selected"],
        "parentNodeId": state_p1_id,
        "data": {
            "interactiveType": "button",
            "header": {"type": "text", "text": "2. Address & Location"},
            "body": "📍 Step 2 of 4: Location & Residential Address\nYour State and District determine your local cadre committee and seva coordination:\n\n• State / UT: Recorded\n• District Unit: Recorded\n• Taluk / Sub-District / Area\n• Postal PIN Code (6-digit)\n• Full Residential Address\n\nTap 'Choose Seva Wing' to continue or change location:",
            "footer": "Maha Seva Dal Foundation",
            "action": {
                "buttons": [
                    {"type": "reply", "reply": {"id": btn_to_wings_id, "title": "Choose Seva Wing"}},
                    {"type": "reply", "reply": {"id": btn_chg_dist_id, "title": "Change State / UT"}},
                    {"type": "reply", "reply": {"id": btn_addr_menu_id, "title": "Back to Main Menu"}}
                ]
            }
        }
    }
    nodes.append(addr_details_node)
    add_edge(addr_details_id, state_p1_id, "Change State / UT", source_handle=btn_chg_dist_id)
    add_edge(addr_details_id, "root", "Back to Main Menu", source_handle=btn_addr_menu_id)

    # Route all other states in Page 1, Page 2, Page 3, Page 4 to addr_details_id
    for st_title, _ in states_p1_def:
        add_edge(state_p1_id, addr_details_id, st_title, source_handle=state_row_ids[st_title])

    for st_title, _ in states_p2_def:
        if st_title != "Karnataka":
            add_edge(state_p2_id, addr_details_id, st_title, source_handle=state_row_ids[st_title])

    for st_title, _ in states_p3_def:
        add_edge(state_p3_id, addr_details_id, st_title, source_handle=state_row_ids[st_title])

    for st_title, _ in states_p4_def:
        if st_title != "Tamil Nadu":
            add_edge(state_p4_id, addr_details_id, st_title, source_handle=state_row_ids[st_title])

    # Route Karnataka districts to Address & PIN
    for d in karnataka_districts:
        add_edge(dist_karnataka_id, addr_details_id, d, source_handle=karnataka_dist_ids[d])

    # Helper to build district pages (all 38 districts lead to addr_details_id)
    def make_district_page(node_id, name, district_list, next_page_id=None, next_page_label=None, prev_node_id=None):
        rows = []
        d_row_ids = {}
        for d in district_list:
            rid = gen_id()
            d_row_ids[d] = rid
            rows.append({"id": rid, "title": d, "description": f"Maha Seva Dal - {d.replace(' District', '')}"})

        more_id = None
        if next_page_id and next_page_label:
            more_id = gen_id()
            rows.append({"id": more_id, "title": next_page_label, "description": "View more districts in Tamil Nadu"})

        page_node = {
            "nodeId": node_id,
            "type": "interactive",
            "name": name,
            "interactiveId": None,
            "keywords": [name],
            "parentNodeId": prev_node_id or profile_node_id,
            "data": {
                "interactiveType": "list",
                "header": {"type": "text", "text": "Select Your District"},
                "body": f"Select your District Unit in Tamil Nadu ({name.split('— ')[-1]}):\nYour district determines your local cadre unit and seva coordination.",
                "footer": "Choose your district",
                "action": {
                    "button": "Choose District",
                    "sections": [
                        {
                            "title": "Tamil Nadu Districts",
                            "rows": rows
                        }
                    ]
                }
            }
        }
        nodes.append(page_node)

        # Every district row leads directly to Address Details node
        for d in district_list:
            add_edge(node_id, addr_details_id, d, source_handle=d_row_ids[d])

        # Paging row leads to next page
        if next_page_id and next_page_label:
            add_edge(node_id, next_page_id, next_page_label, source_handle=more_id)

    make_district_page(dist_p1_id, "Select District — Page 1/5", districts_p1, dist_p2_id, "More Districts (2/5)")
    make_district_page(dist_p2_id, "Select District — Page 2/5", districts_p2, dist_p3_id, "More Districts (3/5)", dist_p1_id)
    make_district_page(dist_p3_id, "Select District — Page 3/5", districts_p3, dist_p4_id, "More Districts (4/5)", dist_p2_id)
    make_district_page(dist_p4_id, "Select District — Page 4/5", districts_p4, dist_p5_id, "More Districts (5/5)", dist_p3_id)
    make_district_page(dist_p5_id, "Select District — Page 5/5", districts_p5, None, None, dist_p4_id)

    # -------------------------------------------------------------
    # 4. STEP 3: PROFESSION & WING CHOICE (MIRRORS WEB STEP 3)
    # -------------------------------------------------------------
    wing_node_id = gen_id()
    wing_rows_defs = [
        ("Legal Wing", "Free legal aid, citizen rights awareness, community justice"),
        ("Medical & Health", "Free medical camps, blood donation drives, health checkups"),
        ("Education & Child Care", "Child welfare, study materials, student mentorship"),
        ("Youth & Sports Wing", "Youth leadership, sports tournaments, fitness awareness"),
        ("Community & Mahaprasad", "Annadanam, community food drives, emergency relief aid"),
        ("General Seva Cadre", "General volunteering, field assistance, event coordination")
    ]

    wing_rows = []
    wing_row_ids = {}
    for title, desc in wing_rows_defs:
        rid = gen_id()
        wing_row_ids[title] = rid
        wing_rows.append({"id": rid, "title": title, "description": desc})

    wing_node = {
        "nodeId": wing_node_id,
        "type": "interactive",
        "name": "Register: Select Wing",
        "interactiveId": btn_to_wings_id,
        "keywords": ["Choose Seva Wing"],
        "parentNodeId": addr_details_id,
        "data": {
            "interactiveType": "list",
            "header": {"type": "text", "text": "3. Profession & Wing"},
            "body": "🏛️ Step 3 of 4: Profession & Wing Choice\nSelect your primary Seva Wing and optional profession for skill-mapping & cadre coordination:\n\n• Current Profession / Occupation (Advocate, Teacher, Doctor, Student, etc.)\n• Choose your dedicated Seva Wing below:",
            "footer": "Choose 1 wing to continue",
            "action": {
                "button": "Select Seva Wing",
                "sections": [
                    {
                        "title": "Maha Seva Dal Wings",
                        "rows": wing_rows
                    }
                ]
            }
        }
    }
    nodes.append(wing_node)
    # Connect Step 2 Address Details -> Step 3 Wing Choice
    add_edge(addr_details_id, wing_node_id, "Choose Seva Wing", source_handle=btn_to_wings_id)

    # -------------------------------------------------------------
    # 5. STEP 4: MANDATORY PASSPORT PHOTO (INSTANT AUTO-APPROVAL)
    # -------------------------------------------------------------
    photo_node_id = gen_id()
    btn_photo_ok_id = gen_id()

    photo_node = {
        "nodeId": photo_node_id,
        "type": "interactive",
        "name": "Register: Passport Photo",
        "interactiveId": None,
        "keywords": ["Wing Selected"],
        "parentNodeId": wing_node_id,
        "data": {
            "interactiveType": "button",
            "header": {"type": "text", "text": "Passport Size Photo"},
            "body": "📸 Passport Size Photo (Mandatory)\nPlease attach or send your clear passport-size photo.\n\n⚡ Instant Auto-Approval:\nOnce you upload your photo, your cadre enrollment is automatically verified and approved instantly! Your official Maha Seva Dal PVC Digital ID Card will be generated and issued right here in WhatsApp.\n\nTap 'Upload Photo 📸' below to select your photo:",
            "footer": "Maha Seva Dal Foundation",
            "action": {
                "buttons": [
                    {"type": "reply", "reply": {"id": btn_photo_ok_id, "title": "Upload Photo 📸"}}
                ]
            }
        }
    }
    nodes.append(photo_node)
    # Route all 6 wings from Step 3 -> Step 4 Passport Photo
    for title, _ in wing_rows_defs:
        add_edge(wing_node_id, photo_node_id, title, source_handle=wing_row_ids[title])

    # -------------------------------------------------------------
    # 6. STEP 5: REVIEW & 1947 OATH OF SERVICE (MIRRORS WEB STEP 4)
    # -------------------------------------------------------------
    review_node_id = gen_id()
    btn_confirm_oath_id = gen_id()
    btn_edit_app_id = gen_id()
    btn_review_menu_id = gen_id()

    review_node = {
        "nodeId": review_node_id,
        "type": "interactive",
        "name": "Register: Review & Oath",
        "interactiveId": btn_photo_ok_id,
        "keywords": ["Upload Photo 📸", "Photo Uploaded ✅"],
        "parentNodeId": photo_node_id,
        "data": {
            "interactiveType": "button",
            "header": {"type": "text", "text": "4. Review & Oath"},
            "body": "📋 Step 4 of 4: Review & Oath of Service\nVerify your enrollment details before official submission:\n\n1. Personal Profile: Deepu Kumar | S/o Sagik P | 12 Jun 1999 | Male | AB+\n2. Emergency: +91 90000 00002 (Mother)\n3. Location: Viluppuram District, Tamil Nadu - 605002\n4. Seva Wing: Legal Wing | Advocate\n5. Passport Photo: Verified & Cropped for PVC Card ✅\n\n🇮🇳 THE 1947 MAHA SEVA DAL PLEDGE:\n'I solemnly pledge to dedicate my service toward the foundational ideals of Maha Seva Dal: Unity of People, selfless social welfare, youth empowerment, and communal harmony without bias of caste, creed, or regional differences.'\n\nTap 'Confirm & Take Oath' to submit:",
            "footer": "Maha Seva Dal Foundation",
            "action": {
                "buttons": [
                    {"type": "reply", "reply": {"id": btn_confirm_oath_id, "title": "Confirm & Take Oath"}},
                    {"type": "reply", "reply": {"id": btn_edit_app_id, "title": "Edit Application"}},
                    {"type": "reply", "reply": {"id": btn_review_menu_id, "title": "Main Menu"}}
                ]
            }
        }
    }
    nodes.append(review_node)
    add_edge(photo_node_id, review_node_id, "Upload Photo 📸", source_handle=btn_photo_ok_id)

    # 'Confirm & Take Oath' is BACKEND-ONLY (webhook generates PVC ID Card)
    # 'Edit Application' routes back to Step 1 Personal Profile
    add_edge(review_node_id, profile_node_id, "Edit Application", source_handle=btn_edit_app_id)
    add_edge(review_node_id, "root", "Main Menu", source_handle=btn_review_menu_id)

    # -------------------------------------------------------------
    # 7. BRANCH B: HISTORY & IDEOLOGY
    # -------------------------------------------------------------
    history_node_id = gen_id()
    btn_hist_menu_id = gen_id()

    history_node = {
        "nodeId": history_node_id,
        "type": "interactive",
        "name": "Briefing: History & Ideology",
        "interactiveId": root_row_ids["History & Ideology"],
        "keywords": ["History & Ideology"],
        "parentNodeId": "root",
        "data": {
            "interactiveType": "button",
            "header": {"type": "text", "text": "Estd. 1947 Heritage"},
            "body": "🏛️ Maha Seva Dal was founded in 1947 in the crucible of Indian Independence.\n\nInspired by Sardar Vallabhbhai Patel, our cadre provided relief camps during the Partition crisis and has served the nation across seven decades of civic and emergency humanitarian seva.\n\nOur motto: Discipline · Service · Unity.",
            "footer": "Maha Seva Dal Legacy",
            "action": {
                "buttons": [
                    {"type": "reply", "reply": {"id": btn_hist_menu_id, "title": "Main Menu"}}
                ]
            }
        }
    }
    nodes.append(history_node)
    add_edge("root", history_node_id, "History & Ideology", source_handle=root_row_ids["History & Ideology"])
    add_edge(history_node_id, "root", "Main Menu", source_handle=btn_hist_menu_id)

    # -------------------------------------------------------------
    # 9. BRANCH D: OUR OFFICIAL WEBSITE PORTAL
    # -------------------------------------------------------------
    website_node_id = gen_id()
    btn_web_visit_id = gen_id()
    btn_web_menu_id = gen_id()

    website_node = {
        "nodeId": website_node_id,
        "type": "interactive",
        "name": "Portal: Official Website",
        "interactiveId": root_row_ids["Our Official Website"],
        "keywords": ["Our Official Website"],
        "parentNodeId": "root",
        "data": {
            "interactiveType": "button",
            "header": {"type": "text", "text": "Official Web Portal"},
            "body": "🌐 Maha Seva Dal Official Web Portal\n\nVisit our digital headquarters:\nhttps://mahasevadal.com\n\nDirect Portal Links:\n• Origins & Legacy: mahasevadal.com/origins\n• Leadership: mahasevadal.com/leadership\n• Cadre Status Check: mahasevadal.com/status\n• Seva Support: mahasevadal.com/support",
            "footer": "Maha Seva Dal Portal",
            "action": {
                "buttons": [
                    {"type": "reply", "reply": {"id": btn_web_visit_id, "title": "Visit Website 🌐"}},
                    {"type": "reply", "reply": {"id": btn_web_menu_id, "title": "Main Menu"}}
                ]
            }
        }
    }
    nodes.append(website_node)
    add_edge("root", website_node_id, "Our Official Website", source_handle=root_row_ids["Our Official Website"])
    add_edge(website_node_id, website_node_id, "Visit Website 🌐", source_handle=btn_web_visit_id)
    add_edge(website_node_id, "root", "Main Menu", source_handle=btn_web_menu_id)

    # -------------------------------------------------------------
    # 10. BRANCH E: DONATE & PAYMENT INVOICE (NO 80G ON WHATSAPP)
    # -------------------------------------------------------------
    donate_node_id = gen_id()
    btn_qr_id = gen_id()
    btn_don_menu_id = gen_id()

    donate_node = {
        "nodeId": donate_node_id,
        "type": "interactive",
        "name": "Donate: Seva Support",
        "interactiveId": root_row_ids["Donate & Support"],
        "keywords": ["Donate & Support"],
        "parentNodeId": "root",
        "data": {
            "interactiveType": "button",
            "header": {"type": "text", "text": "Support Maha Seva Dal"},
            "body": "🙏 Support Maha Seva Dal Seva Initiatives\n\nYour voluntary contributions fund:\n• Daily Annadanam & Community Hunger Relief\n• Free Health Checkup Camps & Medicine Drives\n• Study Kits & Mentorship for Children\n\nOfficial UPI ID: mahasevadal@sbi\n\nTap below to view the Official UPI QR Code and get your Payment Invoice.",
            "footer": "Maha Seva Dal Foundation",
            "action": {
                "buttons": [
                    {"type": "reply", "reply": {"id": btn_qr_id, "title": "Show Donation QR"}},
                    {"type": "reply", "reply": {"id": btn_don_menu_id, "title": "Main Menu"}}
                ]
            }
        }
    }
    nodes.append(donate_node)
    add_edge("root", donate_node_id, "Donate & Support", source_handle=root_row_ids["Donate & Support"])
    add_edge(donate_node_id, "root", "Main Menu", source_handle=btn_don_menu_id)

    # Media Node for Donation QR (Interactive Card with Image & Return to Menu)
    media_qr_id = gen_id()
    btn_qr_menu_id = gen_id()
    media_qr_node = {
        "nodeId": media_qr_id,
        "type": "interactive",
        "name": "Media: Official Donation QR",
        "interactiveId": btn_qr_id,
        "keywords": ["Show Donation QR"],
        "parentNodeId": donate_node_id,
        "data": {
            "interactiveType": "button",
            "header": {"type": "text", "text": "Maha Seva Dal Foundation"},
            "link": "/donation-qr.png",
            "body": "✅ Support Maha Seva Dal Seva Initiatives\n\n🏛️ Fund: General Seva & Relief Fund\n🏦 UPI ID: mahasevadal@sbi\n👤 Account Name: Maha Seva Dal Foundation\n\n📲 Scan the QR code above or pay directly to the UPI ID.\n\n📸 After payment:\nSend your payment screenshot or Transaction ID (UTR) here in this chat. We verify and deliver your Official Donation Payment Invoice instantly.",
            "footer": "Official Cadre Registry · Estd. 1947",
            "action": {
                "buttons": [
                    {"type": "reply", "reply": {"id": btn_qr_menu_id, "title": "Main Menu"}}
                ]
            }
        }
    }
    nodes.append(media_qr_node)
    add_edge(donate_node_id, media_qr_id, "Show Donation QR", source_handle=btn_qr_id)
    add_edge(media_qr_id, "root", "Main Menu", source_handle=btn_qr_menu_id)

    # -------------------------------------------------------------
    # CONSTRUCT WACTO FLOW DICT
    # -------------------------------------------------------------
    flow = {
        "chatbot": {
            "name": "Maha Seva Dal (MSD) v1 (English)"
        },
        "nodes": nodes,
        "edges": edges,
        "manualResolution": False
    }

    return flow, keyword_dests

if __name__ == "__main__":
    flow, keyword_dests = build_msd_flow()

    # Check for keyword routing ambiguities
    ambiguities = {kw: dests for kw, dests in keyword_dests.items() if len(dests) > 1}
    if ambiguities:
        print("ERROR: Keyword routing ambiguities detected:")
        for kw, dests in ambiguities.items():
            print(f"  '{kw}' -> {dests}")
        sys.exit(1)

    # Output paths
    out_dirs = [
        r"D:\MSD-main\MSD-main\wacto",
        r"D:\MSD-main\MSD-main\outputs\wacto"
    ]
    for d in out_dirs:
        os.makedirs(d, exist_ok=True)

    out_file1 = r"D:\MSD-main\MSD-main\wacto\msd_chatbot_flow_v1_en.json"
    out_file2 = r"D:\MSD-main\MSD-main\outputs\wacto\msd_chatbot_flow_v1_en.json"

    with open(out_file1, "w", encoding="utf-8") as f:
        json.dump(flow, f, indent=2, ensure_ascii=False)
    print(f"Saved flow to: {out_file1}")

    with open(out_file2, "w", encoding="utf-8") as f:
        json.dump(flow, f, indent=2, ensure_ascii=False)
    print(f"Saved flow to: {out_file2}")

    print(f"Total Nodes: {len(flow['nodes'])}")
    print(f"Total Edges: {len(flow['edges'])}")
