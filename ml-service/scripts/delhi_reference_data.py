"""
DELHI REFERENCE DATA
====================
Real Delhi Police districts, real police stations, real metro stations,
real hospitals, and real markets used as anchors for the synthetic
locality master list. Sourced from Delhi Police public district pages
and verified public references (see docs/data_dictionary.md for sources).

Coordinates are APPROXIMATE district-level bounding boxes based on known
Delhi geography (Yamuna river splits East/Shahdara from the rest; South
district is below Ring Road toward Mehrauli; North is Old Delhi / Delhi
University belt; Dwarka/Outer/Najafgarh are far south-west, etc.).
Individual locality points are placed within their district's bounding
box with a name-consistent jitter -- this gives realistic district-level
geography without claiming survey-grade per-locality geocoding, which is
disclosed in docs/data_dictionary.md.
"""

# 15 real Delhi Police districts with approximate bounding boxes
# (min_lat, max_lat, min_lon, max_lon) -- rough, non-overlapping-ish zones
DISTRICTS = {
    "Central":      (28.630, 28.665, 77.200, 77.240),
    "New Delhi":    (28.595, 28.635, 77.190, 77.230),
    "North":        (28.670, 28.720, 77.190, 77.230),
    "North East":   (28.670, 28.710, 77.250, 77.300),
    "North West":   (28.680, 28.740, 77.130, 77.180),
    "West":         (28.630, 28.670, 77.070, 77.130),
    "South West":   (28.560, 28.610, 77.050, 77.140),
    "South":        (28.480, 28.540, 77.180, 77.230),
    "South East":   (28.520, 28.570, 77.230, 77.290),
    "East":         (28.600, 28.640, 77.280, 77.320),
    "Shahdara":     (28.660, 28.690, 77.280, 77.320),
    "Dwarka":       (28.560, 28.610, 76.990, 77.070),
    "Outer":        (28.660, 28.710, 77.000, 77.070),
    "Outer North":  (28.720, 28.820, 77.070, 77.150),
    "Rohini":       (28.700, 28.750, 77.080, 77.140),
}

# Real police stations by district (subset drawn from Delhi Police public
# district-wise station lists) -- also doubles as real locality/neighborhood
# names, since each station's catchment area IS the named neighborhood.
POLICE_STATIONS = {
    "Central": ["Anand Parbat", "Nabi Karim", "Chandni Mahal", "Jama Masjid",
                "Karol Bagh", "Hauz Qazi", "Prasad Nagar", "Patel Nagar",
                "Rajinder Nagar", "Ranjit Nagar", "Darya Ganj", "Kamla Market"],
    "New Delhi": ["Connaught Place", "Barakhamba Road", "Mandir Marg",
                  "Chanakya Puri", "Parliament Street", "Tilak Marg",
                  "Tughlak Road", "South Avenue"],
    "North": ["Subzi Mandi", "Civil Lines", "Kashmiri Gate", "Timarpur",
              "Roop Nagar", "Gulabi Bagh", "Burari", "Sadar Bazar",
              "Kotwali", "Wazirabad", "Sarai Rohilla"],
    "North East": ["Bhajanpura", "Gokulpuri", "Harsh Vihar", "Jafrabad",
                   "Karawal Nagar", "Khajuri Khas", "Nand Nagri",
                   "Seelampur", "Shastri Park", "Sonia Vihar", "Welcome"],
    "North West": ["Ashok Vihar", "Model Town", "Jahangirpuri",
                   "Mukherjee Nagar", "Keshav Puram", "Rani Bagh",
                   "Shalimar Bagh", "Subhash Place", "Pitampura", "Adarsh Nagar"],
    "West": ["Moti Nagar", "Naraina", "Punjabi Bagh", "Rajouri Garden",
             "Tilak Nagar", "Kirti Nagar", "Hari Nagar", "Vikaspuri",
             "Mayapuri", "Janakpuri"],
    "South West": ["Delhi Cantt", "Sagarpur", "Kapashera", "R.K. Puram",
                   "Palam Village", "Vasant Vihar", "Vasant Kunj",
                   "Kishan Garh", "Sarojini Nagar", "Safdarjung Enclave"],
    "South": ["Hauz Khas", "Greater Kailash", "Mehrauli", "C.R. Park",
              "Lodhi Colony", "Sangam Vihar", "Saket", "Defence Colony",
              "Malviya Nagar", "Maidan Garhi", "Tigri", "Neb Sarai"],
    "South East": ["Kalkaji", "Sarita Vihar", "Lajpat Nagar", "Govindpuri",
                   "Hazrat Nizamuddin", "Jamia Nagar", "Okhla",
                   "New Friends Colony", "Shaheen Bagh", "Kalindi Kunj"],
    "East": ["Preet Vihar", "Mayur Vihar", "Ghazipur", "New Ashok Nagar",
             "Kalyanpuri", "Madhu Vihar", "Shakarpur", "Laxmi Nagar",
             "Mandawali", "Patparganj"],
    "Shahdara": ["Mansarovar Park", "Anand Vihar", "Seemapuri",
                 "Gandhi Nagar", "Krishna Nagar", "Geeta Colony",
                 "Vivek Vihar", "Jagatpuri", "Dilshad Garden"],
    "Dwarka": ["Dwarka Sector 23", "Dwarka North", "Dwarka South",
               "Najafgarh", "Dabri", "Uttam Nagar", "Bindapur",
               "Chhawla", "Mohan Garden"],
    "Outer": ["Nihal Vihar", "Mundka", "Paschim Vihar", "Nangloi",
              "Mangol Puri", "Ranhola", "Sultanpuri", "Raj Park"],
    "Outer North": ["Narela", "Alipur", "Samaipur Badli", "Bawana",
                    "Shahbad Dairy", "Swaroop Nagar", "Bhalswa Dairy"],
    "Rohini": ["Rohini Sector 3", "Vijay Vihar", "Rohini Sector 7",
               "Prem Nagar", "Begampur", "Budh Vihar", "Rohini Sector 16",
               "Prashant Vihar", "Aman Vihar", "Kanjhawala"],
}

# Real, well-known Delhi Metro stations used to compute metro-distance features
METRO_STATIONS = [
    ("Rajiv Chowk", 28.6328, 77.2197), ("Kashmere Gate", 28.6675, 77.2276),
    ("Central Secretariat", 28.6147, 77.2122), ("Hauz Khas", 28.5433, 77.2066),
    ("Chandni Chowk", 28.6506, 77.2303), ("Karol Bagh", 28.6516, 77.1906),
    ("Lajpat Nagar", 28.5677, 77.2434), ("Kalkaji Mandir", 28.5478, 77.2589),
    ("Rohini Sector 18", 28.7169, 77.1244), ("Pitampura", 28.6988, 77.1317),
    ("Dwarka Sector 21", 28.5525, 77.0585), ("Janakpuri West", 28.6292, 77.0873),
    ("Rajouri Garden", 28.6467, 77.1225), ("Preet Vihar", 28.6357, 77.2955),
    ("Mayur Vihar-I", 28.6053, 77.2913), ("Shahdara", 28.6692, 77.2911),
    ("Vishwavidyalaya", 28.6969, 77.2098), ("Saket", 28.5245, 77.2066),
    ("INA", 28.5751, 77.2091), ("Netaji Subhash Place", 28.6969, 77.1517),
]

# Real major hospitals used to compute hospital-distance features
HOSPITALS = [
    ("AIIMS Delhi", 28.5672, 77.2100), ("Safdarjung Hospital", 28.5691, 77.2067),
    ("RML Hospital", 28.6362, 77.2007), ("LNJP Hospital", 28.6423, 77.2372),
    ("GTB Hospital", 28.6997, 77.3122), ("Ganga Ram Hospital", 28.6398, 77.1900),
    ("Apollo Hospital Sarita Vihar", 28.5397, 77.2913),
    ("Max Hospital Saket", 28.5273, 77.2145), ("Fortis Shalimar Bagh", 28.7157, 77.1573),
    ("BLK Hospital", 28.6395, 77.1874), ("Deen Dayal Upadhyay Hospital", 28.6469, 77.1444),
    ("Lok Nayak Hospital", 28.6423, 77.2372), ("Rohini Hospital (BSA)", 28.7128, 77.1114),
]

# Real major markets used for market-density features
MARKETS = [
    "Connaught Place", "Khan Market", "Sarojini Nagar Market", "Lajpat Nagar Central Market",
    "Karol Bagh Market", "Chandni Chowk", "INA Market", "Sadar Bazaar",
    "Chawri Bazar", "Kamla Nagar Market", "Green Park Market", "GK-I M Block Market",
    "South Extension Market", "Palika Bazaar", "Dilli Haat",
]
