import re

with open('lib/site-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# ZeroLag
old_zerolag = r"(?s)id: 'proj-zerolag'.*?metrics: \{ label: 'Intent Classification', value: '98.6%' \},\n    \}"
new_zerolag = r"""id: 'proj-zerolag',
    title: 'ZeroLag',
    tagline: 'Autonomous Multi-Agent Sales Intelligence Command Center',
    description:
      'Autonomous multi-operator AI platform that ingests unstructured sales communications, classifies high-value buyer intent with 98.6% confidence, and triggers CRM workflows with zero manual latency.',
    architectureHighlight: '5-Operator Agentic Pipeline with real-time intent classification and webhook dispatchers.',
    category: 'Agentic AI & Systems',
    technologies: ['TypeScript', 'Next.js 15', 'FastAPI', 'Agentic Workflows', 'Tailwind CSS'],
    deckUrl: '/documents/supervity-pitchdeck.pdf',
    certificateUrl: '/certificates/Sales Intelligence Winner - 2nd Place.png',
    featured: true,
    highlight: '2nd Place @ Supervity Hackathon 2026',
    metrics: { label: 'Intent Classification', value: '98.6%' },
    }"""
content = re.sub(old_zerolag, new_zerolag, content)

# Bilahujan
old_bilahujan = r"(?s)id: 'proj-bilahujan'.*?metrics: \{ label: 'Early Warning Window', value: '3.5 Hours' \},\n    \}"
new_bilahujan = r"""id: 'proj-bilahujan',
    title: 'BILAHUJAN',
    tagline: 'AI-Powered Disaster Preparedness & Flood Response Network',
    description:
      'Real-time crisis management mobile and cloud system providing predictive flood level alerts, nearest evacuation telemetry, and offline emergency dispatch routes for vulnerable communities.',
    architectureHighlight: 'Live IoT telemetry ingestion with automated SMS dispatch and GIS nearest-shelter pathfinding.',
    category: 'Mobile & Cloud IoT',
    technologies: ['Flutter', 'Python', 'FastAPI', 'GIS Mapping', 'Supabase'],
    githubUrl: 'https://github.com/HowardWoon/BILAHUJAN-VHack2026',
    liveUrl: 'https://bilahujan-vhack.web.app/',
    certificateUrl: '/certificates/VHack 2026.pdf',
    featured: true,
    highlight: 'VHack 2026 Finalist',
    metrics: { label: 'Early Warning Window', value: '3.5 Hours' },
    }"""
content = re.sub(old_bilahujan, new_bilahujan, content)

# Sensor X Sensei
old_sensor = r"(?s)id: 'proj-sensor-sensei'.*?metrics: \{ label: 'Energy Reduction', value: '28.4%' \},\n    \}"
new_sensor = r"""id: 'proj-sensor-sensei',
    title: 'Sensor X Sensei',
    tagline: 'Smart Micro-Climate Energy Management System',
    description: 'Intelligent, automated energy management solution for modern lecture halls leveraging IoT-based occupancy tracking to dynamically route power and HVAC ventilation only to occupied rows.',
    architectureHighlight: 'Dual-rail power system via ESP32, authenticated via NFC with real-time C++ WebServer telemetry and Glassmorphism dashboard.',
    category: 'Hardware & IoT Systems',
    technologies: ['C++', 'ESP32', 'React', 'Tailwind CSS', 'IoT Sensors'],
    githubUrl: 'https://github.com/HowardWoon/Sensor-X-Sensei---UM-Technothon-2026',
    certificateUrl: '/certificates/UM TECHNOTHON 2026.pdf',
    featured: false,
    highlight: 'UM Technothon 2026 Finalist',
    metrics: { label: 'Energy Reduction', value: '28.4%' },
    }"""
content = re.sub(old_sensor, new_sensor, content)


with open('lib/site-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)
