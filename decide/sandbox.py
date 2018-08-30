# cache data for 24 hours and use cached data if available. Store business ids indefinetly
"""

    Example call:

        ./examples.py "[API Key]"

"""



from yelpapi import YelpAPI

import argparse

from pprint import pprint



argparser = argparse.ArgumentParser(description='Example Yelp queries using yelpapi. '

                                                'Visit https://www.yelp.com/developers/v3/manage_app to get the '

                                                'necessary API keys.')

# argparser.add_argument('api_key', type=str, help='Yelp Fusion API Key')

# args = argparser.parse_args()

api_key = "JPSD1KTG7J2HiXxo4r63wcWAqxMmj0lElhIOl-43xT4HYcEM4WiCbStLOG96HDtIeQMF6eSZF0AXntwxRTEhsCuSF2pY2zNF_rZmVF7JfB3iBe6EDVLf0oW30M1xW3Yx"



yelp_api = YelpAPI(api_key)



"""

    Example search by location text and term.



    Search API: https://www.yelp.com/developers/documentation/v3/business_search

"""

# print('***** 5 best rated ice cream places in Austin, TX *****\n{}\n'.format("yelp_api.search_query(term='ice cream', "

#                                                                              "location='austin, tx', sort_by='rating', "

#                                                                              "limit=5)"))

response = yelp_api.search_query(term='ice cream', location='94949', sort_by='rating', limit=5)

businesses = response["businesses"]
# pprint(response)
for i in businesses:
    pprint(i["alias"])
    # for j in businesses[i]:
    #     pprint (j["alias"])
# for i in businesses:
#     pprint(businesses[i].alias)

print('\n-------------------------------------------------------------------------\n')

