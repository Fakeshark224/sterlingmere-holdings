import sys
import os
import re
import csv
import time
from ddgs import DDGS
from urllib.parse import urlparse

# Fix Windows console encoding for special characters
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def generate_dm(name, niche):
    return f"Hi {name}, I came across your page and love what you're doing in the {niche} space! I noticed you are running your business primarily off social media. I run Sterlingmere Holdings and we build premium websites that help businesses like yours double their leads and look ultra-professional. Would you be open to a quick chat to see what we could do for you? Check out our work: https://sterlingmereholdings.vercel.app/"

def clean_name(title):
    # Remove common FB/Insta suffixes from titles
    suffixes = ["- Home", "| Facebook", "- Instagram photos and videos", " | Instagram", " | LinkedIn"]
    for s in suffixes:
        title = title.split(s)[0]
    return title.strip()

def run_osint_scraper(niche, location, count=30):
    print("=" * 60)
    print("  STERLINGMERE DM ENGINE (Social OSINT Mode)")
    print(f"  Target: {niche} in {location}")
    print("=" * 60)
    
    # Run separate queries for broader DuckDuckGo parsing
    queries = [
        f'"{niche}" "{location}" site:instagram.com',
        f'"{niche}" "{location}" site:facebook.com'
    ]
    
    results = []
    seen_urls = set()
    
    try:
        ddgs = DDGS()
        for query in queries:
            print(f"[SEARCH] Query: {query}")
            search_results = list(ddgs.text(query, max_results=count//2))
            
            for r in search_results:
                url = r.get('href', '') or r.get('link', '')
                title = r.get('title', '')
                body = r.get('body', '')
                
                if not url: continue
                
                # Filter out junk Facebook/Instagram directory, tag, and old timeline pages
                skip_paths = ['/biz/', '/places/', '/pages/category/', '/public/', '/directory/', '/explore/', '/tags/', '/timeline/', '/pg/']
                if any(path in url.lower() for path in skip_paths):
                    continue
                
                b_name = clean_name(title)
                
                # Avoid duplicate pages
                if url not in seen_urls:
                    seen_urls.add(url)
                    dm_script = generate_dm(b_name, niche)
                    
                    print(f"[+] FOUND: {b_name}")
                    print(f"    Platform: {urlparse(url).netloc}")
                    print(f"    Link:     {url}\n")
                    
                    results.append({
                        "Business Name": b_name,
                        "Social Link": url,
                        "Niche": niche,
                        "DM Script": dm_script
                    })
            time.sleep(1) # Be polite to DDG
    except Exception as e:
        print(f"[X] Search Error: {e}")
        
    print(f"\n[INFO] Successfully extracted {len(results)} WhatsApp/Social leads.\n")
    
    if results:
        file_exists = os.path.exists("dm_leads.csv")
        with open("dm_leads.csv", mode='a', newline='', encoding='utf-8') as f:
            fieldnames = ["Business Name", "Social Link", "Niche", "DM Script"]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            if not file_exists:
                writer.writeheader()
            writer.writerows(results)
        print(f"Saved to dm_leads.csv! Open this file on your phone to start copying and pasting DMs.")

if __name__ == "__main__":
    if not sys.stdin.isatty():
        lines = sys.stdin.read().strip().split('\n')
        niche = lines[0].strip() if len(lines) > 0 else "Cafes"
        location = lines[1].strip() if len(lines) > 1 else "Mumbai"
        count = int(lines[2].strip()) if len(lines) > 2 and lines[2].strip().isdigit() else 30
    else:
        niche = input("Enter target niche (e.g., Cafes, Dentists): ").strip()
        location = input("Enter target location (e.g., Mumbai, Pune): ").strip()
        count_input = input("How many profiles to scan? (default 30): ").strip()
        count = int(count_input) if count_input.isdigit() else 30
        
    run_osint_scraper(niche, location, count)
