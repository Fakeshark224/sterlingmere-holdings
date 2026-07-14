import sys
import os
# Fix Windows console encoding for special characters
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

import requests
from bs4 import BeautifulSoup
from ddgs import DDGS
import re
import csv
import time
from datetime import datetime
from urllib.parse import urlparse, urljoin

# --- CONFIGURATION ---
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}
REQUEST_TIMEOUT = 10  # seconds

# Pages to check for contact emails beyond the homepage
CONTACT_PATHS = ["/contact", "/contact-us", "/about", "/about-us", "/team", "/support"]


def search_businesses(niche, location, num_results=20, strategy=1):
    """Uses DuckDuckGo to find business websites for a given niche and location."""
    query = f"{niche} in {location}"
    print(f"\n[SEARCH] Searching for: \"{query}\"")
    print("-" * 50)
    
    results = []
    try:
        ddgs = DDGS()
        search_results = list(ddgs.text(query, max_results=num_results))
        print(f"  [DEBUG] Raw results count: {len(search_results)}")
        
        for r in search_results:
            url = r.get('href', '') or r.get('link', '') or r.get('url', '')
            title = r.get('title', '')
            
            if not url:
                print(f"  [DEBUG] Skipping result with no URL: {r}")
                continue
            
            # Filter out social media, directories, and aggregator sites
            skip_domains = ["facebook.com", "instagram.com", "twitter.com", "linkedin.com",
                            "yelp.com", "yellowpages.com", "google.com", "wikipedia.org",
                            "youtube.com", "reddit.com", "tiktok.com", "pinterest.com",
                            "tripadvisor.com", "bbb.org", "nextdoor.com", "thumbtack.com",
                            "angi.com", "homeadvisor.com", "mapquest.com", "justdial.com",
                            "practo.com", "sulekha.com", "crunchbase.com"]
            
            domain_is_skipped = any(domain in url.lower() for domain in skip_domains)
            
            if strategy == 1:
                # Premium Mode: We only want standalone websites, skip directories
                if domain_is_skipped:
                    continue
            elif strategy == 2:
                # Hustler Mode: We ONLY want directories (to find businesses without websites)
                if not domain_is_skipped:
                    continue
            
            results.append({"url": url, "title": title})
            print(f"  [+] Found: {title}")
            print(f"      URL:   {url}")
    except Exception as e:
        print(f"  [X] Search error: {type(e).__name__}: {e}")
    
    print(f"\n[INFO] Found {len(results)} potential business websites.\n")
    return results


def extract_emails_from_page(url):
    """Downloads a webpage and extracts all email addresses from its HTML."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        if response.status_code != 200:
            return set()
        
        html = response.text
        
        # Regex pattern to find email addresses
        email_pattern = r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'
        found_emails = set(re.findall(email_pattern, html))
        
        # Also check for mailto: links which are more reliable
        soup = BeautifulSoup(html, 'html.parser')
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            if href.startswith('mailto:'):
                email = href.replace('mailto:', '').split('?')[0].strip()
                if email:
                    found_emails.add(email)
        
        # Filter out fake/image/script emails
        filtered = set()
        for email in found_emails:
            email_lower = email.lower()
            # Skip common non-business emails
            skip_patterns = [".png", ".jpg", ".gif", ".svg", ".webp", ".css", ".js",
                             "example.com", "test.com", "email.com", "domain.com",
                             "sentry.io", "wixpress.com", "wordpress.com", "googleapis.com",
                             "w3.org", "schema.org", "gravatar.com", "cloudflare.com",
                             "yourname@", "your@", "name@", "user@", "admin@"]
            if any(pat in email_lower for pat in skip_patterns):
                continue
            filtered.add(email)
        
        return filtered
    except Exception:
        return set()


def extract_business_name_from_search(search_title, url):
    """Uses the search result title as the business name, with domain fallback."""
    if search_title:
        # Clean up common suffixes
        title = search_title
        for suffix in [" | Home", " - Home", " | Official", " - Official", 
                       " | Website", " - Website", " |", " -"]:
            title = title.split(suffix)[0]
        cleaned = title.strip()[:60]
        if cleaned:
            return cleaned
    # Fallback: use the domain name
    domain = urlparse(url).netloc.replace("www.", "")
    return domain


def scrape_leads(niche, location, num_results=20, strategy=1):
    """Main scraping pipeline: Search -> Crawl -> Extract -> Save."""
    
    print("=" * 60)
    print(f"  STERLINGMERE LEAD SCRAPER")
    print(f"  Niche: {niche}")
    print(f"  Location: {location}")
    print(f"  Target: {num_results} websites")
    print(f"  Strategy: {'1 (Premium Websites)' if strategy == 1 else '2 (Directory Listings)'}")
    print("=" * 60)
    
    # Step 1: Search the web
    search_results = search_businesses(niche, location, num_results, strategy)
    
    if not search_results:
        print("[X] No websites found. Try a different niche or location.")
        return
    
    leads = []
    
    # Step 2: Crawl each website for emails
    for i, result in enumerate(search_results, 1):
        url = result['url']
        title = result['title']
        print(f"[{i}/{len(search_results)}] Crawling: {url}")
        
        all_emails = set()
        
        # Check homepage
        emails = extract_emails_from_page(url)
        all_emails.update(emails)
        
        # Check contact/about pages
        for path in CONTACT_PATHS:
            contact_url = urljoin(url, path)
            emails = extract_emails_from_page(contact_url)
            all_emails.update(emails)
        
        # Extract business name
        business_name = extract_business_name_from_search(title, url)
        
        if all_emails:
            primary_email = list(all_emails)[0]
            print(f"  [EMAIL] Found: {primary_email} ({business_name})")
            leads.append({
                "Business Name": business_name,
                "Email": primary_email,
                "Niche": niche,
                "Website": url
            })
        else:
            print(f"  [SKIP] No email found, skipping.")
        
        # Be polite - don't overwhelm servers
        time.sleep(1)
    
    # Step 3: Deduplicate by email
    seen_emails = set()
    unique_leads = []
    for lead in leads:
        if lead['Email'] not in seen_emails:
            seen_emails.add(lead['Email'])
            unique_leads.append(lead)
    leads = unique_leads
    
    # Step 4: Save to leads.csv (append mode, won't overwrite existing leads)
    if leads:
        try:
            file_exists = os.path.exists("leads.csv")
            existing_size = os.path.getsize("leads.csv") if file_exists else 0
            
            with open("leads.csv", mode='a', newline='', encoding='utf-8') as f:
                fieldnames = ["Business Name", "Email", "Niche", "Website"]
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                if not file_exists or existing_size == 0:
                    writer.writeheader()
                writer.writerows(leads)
            
            print("\n" + "=" * 60)
            print(f"  SUCCESS! Found {len(leads)} unique leads with emails!")
            print(f"  Saved to leads.csv")
            print(f"  Run 'python outreach_bot.py' to email them all!")
            print("=" * 60)
        except PermissionError:
            print("\n[!] ERROR: leads.csv is open in another program (Excel?).")
            print("    Please close it and re-run the scraper.")
            print(f"    (We found {len(leads)} leads that were NOT saved.)")
    else:
        print("\n[X] No emails could be extracted from any of the websites.")
        print("    Try a different niche or location.")


if __name__ == "__main__":
    print("\n STERLINGMERE HOLDINGS - Lead Scraper\n")
    
    # Support both interactive and piped input
    if not sys.stdin.isatty():
        # Piped input mode
        lines = sys.stdin.read().strip().split('\n')
        niche = lines[0].strip() if len(lines) > 0 else "Dentists"
        location = lines[1].strip() if len(lines) > 1 else "Delhi India"
        count = int(lines[2].strip()) if len(lines) > 2 and lines[2].strip().isdigit() else 15
        strategy = int(lines[3].strip()) if len(lines) > 3 and lines[3].strip().isdigit() else 1
    else:
        # Interactive mode
        niche = input("Enter target niche (e.g., Dentists, Roofers, Restaurants): ").strip()
        location = input("Enter target location (e.g., Austin Texas, London UK): ").strip()
        count_input = input("How many websites to scan? (default 20): ").strip()
        count = int(count_input) if count_input.isdigit() else 20
        
        print("\nChoose Target Strategy:")
        print("  1. Premium Upgrades (Finds businesses with standalone websites)")
        print("  2. Directory Hustlers (Finds businesses listed on YellowPages/Directories without websites)")
        strat_input = input("Enter 1 or 2 (default 1): ").strip()
        strategy = 2 if strat_input == "2" else 1
    
    scrape_leads(niche, location, count, strategy)
