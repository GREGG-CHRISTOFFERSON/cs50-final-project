import feedparser
import urllib.parse

from cs50 import SQL, eprint
from flask import redirect, render_template, request, session
from functools import wraps
from yelpapi import YelpAPI

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///decide.db")

# Configure Yelp API key. https://www.yelp.com/developers/v3/manage_app
api_key = "JPSD1KTG7J2HiXxo4r63wcWAqxMmj0lElhIOl-43xT4HYcEM4WiCbStLOG96HDtIeQMF6eSZF0AXntwxRTEhsCuSF2pY2zNF_rZmVF7JfB3iBe6EDVLf0oW30M1xW3Yx"
yelp_api = YelpAPI(api_key)

def login_required(f):
    """
    Decorate routes to require login.

    http://flask.pocoo.org/docs/0.12/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function


def lookup(geo):
    """Look up articles for geo"""

    # Check cache
    try:
        if geo in lookup.cache:
            return lookup.cache[geo]
    except AttributeError:
        lookup.cache = {}

    # Replace special characters
    escaped = urllib.parse.quote(geo, safe="")

    # Get feed from Google
    feed = feedparser.parse(f"https://news.google.com/news/rss/local/section/geo/{escaped}")

    # If no items in feed, get feed from Onion
    if not feed["items"]:
        feed = feedparser.parse("http://www.theonion.com/feeds/rss")

    # Cache results
    lookup.cache[geo] = [{"link": item["link"], "title": item["title"]} for item in feed["items"]]

    # Return results
    return lookup.cache[geo]


def lookup_details(str_location, location_businesses):
    """Look up business details for location businesses"""

    str_location = str_location

    # for id in location_businesses, look up business details from database
    for business in location_businesses:

        # look up business details on yelp
        response = yelp_api.business_query(id=business["id"])

        # check that the business details aren't already in the database
        details = db.execute("SELECT * FROM businesses WHERE id = :id", id=response["id"])

        # if not already in database, add to database
        if len(details) == 0:
            db.execute('''INSERT INTO businesses (id, name, url, price, rating, review_count, phone, photos, categories, coordinates, location)
                                              VALUES (:id, :name, :url, :price, :rating, :review_count, :phone, :photos, :categories, :coordinates, :location)''',
                                              id=response["id"], name=response["name"], url=response["url"], price=response["price"], rating=response["rating"],
                                              review_count=response["review_count"], phone=response["display_phone"], photos=str(response["photos"]),
                                              categories=str(response["categories"]), coordinates=str(response["coordinates"]), location=str_location)

    # query database for  business details
    business_details = db.execute("SELECT * FROM businesses WHERE location = :location", location=str_location)

    # return results
    return business_details