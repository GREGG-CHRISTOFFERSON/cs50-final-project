import feedparser
import sqlalchemy_declarative 
import urllib.parse

from application import app, db, api_key, yelp_api
from cs50 import eprint
from flask import redirect, render_template, request, session
from functools import wraps
 


def lookup_details(str_location, location_businesses):
    """Look up business details for location businesses"""

    str_location = str_location

    eprint("Looking up business details for location")

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
                                              {"id": response["id"], "name": response["name"], "url": response["url"], "price": response["price"], "rating": response["rating"],
                                              "review_count": response["review_count"], "phone": response["display_phone"], "photos": str(response["photos"]),
                                              "categories": str(response["categories"]), "coordinates": str(response["coordinates"]), "location": str_location})

    # query database for  business details
    business_details = db.execute("SELECT * FROM businesses WHERE location = :location", location=str_location).fetchall()

    # return results
    return business_details