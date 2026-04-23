// All 50 US states + DC with state flower info (for SEO-rich content)

export type USState = {
  name: string;
  code: string;      // 2-letter abbreviation
  slug: string;      // URL slug
  capital: string;
  stateFlower: string;
  flowerDesc: string;    // short description of the state flower
  nickname: string;
};

export const US_STATES: USState[] = [
  { name: "Alabama", code: "AL", slug: "alabama", capital: "Montgomery", stateFlower: "Camellia", flowerDesc: "A waxy, rose-like bloom that flourishes in Alabama's mild winters.", nickname: "The Yellowhammer State" },
  { name: "Alaska", code: "AK", slug: "alaska", capital: "Juneau", stateFlower: "Forget-Me-Not", flowerDesc: "A hardy blue wildflower symbolizing faithfulness.", nickname: "The Last Frontier" },
  { name: "Arizona", code: "AZ", slug: "arizona", capital: "Phoenix", stateFlower: "Saguaro Cactus Blossom", flowerDesc: "The creamy white flower of the iconic saguaro cactus.", nickname: "The Grand Canyon State" },
  { name: "Arkansas", code: "AR", slug: "arkansas", capital: "Little Rock", stateFlower: "Apple Blossom", flowerDesc: "Delicate pink-white blooms from the state's signature fruit tree.", nickname: "The Natural State" },
  { name: "California", code: "CA", slug: "california", capital: "Sacramento", stateFlower: "California Poppy", flowerDesc: "Brilliant orange wildflower that carpets golden hillsides each spring.", nickname: "The Golden State" },
  { name: "Colorado", code: "CO", slug: "colorado", capital: "Denver", stateFlower: "Rocky Mountain Columbine", flowerDesc: "A delicate blue-and-white alpine flower found in the Rockies.", nickname: "The Centennial State" },
  { name: "Connecticut", code: "CT", slug: "connecticut", capital: "Hartford", stateFlower: "Mountain Laurel", flowerDesc: "Clusters of pink and white bell-shaped blooms.", nickname: "The Constitution State" },
  { name: "Delaware", code: "DE", slug: "delaware", capital: "Dover", stateFlower: "Peach Blossom", flowerDesc: "Soft pink spring blossoms from peach orchards.", nickname: "The First State" },
  { name: "Florida", code: "FL", slug: "florida", capital: "Tallahassee", stateFlower: "Orange Blossom", flowerDesc: "Fragrant white blossoms from the state's citrus groves.", nickname: "The Sunshine State" },
  { name: "Georgia", code: "GA", slug: "georgia", capital: "Atlanta", stateFlower: "Cherokee Rose", flowerDesc: "A fragrant white climbing rose with yellow centers.", nickname: "The Peach State" },
  { name: "Hawaii", code: "HI", slug: "hawaii", capital: "Honolulu", stateFlower: "Yellow Hibiscus", flowerDesc: "Native golden hibiscus, vibrant and tropical.", nickname: "The Aloha State" },
  { name: "Idaho", code: "ID", slug: "idaho", capital: "Boise", stateFlower: "Syringa", flowerDesc: "Fragrant white mock orange blossoms.", nickname: "The Gem State" },
  { name: "Illinois", code: "IL", slug: "illinois", capital: "Springfield", stateFlower: "Violet", flowerDesc: "A small purple wildflower common across the Midwest.", nickname: "The Prairie State" },
  { name: "Indiana", code: "IN", slug: "indiana", capital: "Indianapolis", stateFlower: "Peony", flowerDesc: "Lush, full-petaled blooms in pink, white, and red.", nickname: "The Hoosier State" },
  { name: "Iowa", code: "IA", slug: "iowa", capital: "Des Moines", stateFlower: "Wild Rose", flowerDesc: "Simple five-petal pink wild rose native to the prairie.", nickname: "The Hawkeye State" },
  { name: "Kansas", code: "KS", slug: "kansas", capital: "Topeka", stateFlower: "Sunflower", flowerDesc: "The golden sunflower — tall, bright, and unmistakable.", nickname: "The Sunflower State" },
  { name: "Kentucky", code: "KY", slug: "kentucky", capital: "Frankfort", stateFlower: "Goldenrod", flowerDesc: "Tall golden-yellow wildflower that blooms in late summer.", nickname: "The Bluegrass State" },
  { name: "Louisiana", code: "LA", slug: "louisiana", capital: "Baton Rouge", stateFlower: "Magnolia", flowerDesc: "Large, fragrant white blooms of the Southern magnolia.", nickname: "The Pelican State" },
  { name: "Maine", code: "ME", slug: "maine", capital: "Augusta", stateFlower: "White Pine Cone and Tassel", flowerDesc: "The cone of Maine's iconic eastern white pine.", nickname: "The Pine Tree State" },
  { name: "Maryland", code: "MD", slug: "maryland", capital: "Annapolis", stateFlower: "Black-Eyed Susan", flowerDesc: "Golden petals surrounding a dark center.", nickname: "The Old Line State" },
  { name: "Massachusetts", code: "MA", slug: "massachusetts", capital: "Boston", stateFlower: "Mayflower", flowerDesc: "Delicate pink and white trailing arbutus.", nickname: "The Bay State" },
  { name: "Michigan", code: "MI", slug: "michigan", capital: "Lansing", stateFlower: "Apple Blossom", flowerDesc: "Pink-white fragrant blooms from apple orchards.", nickname: "The Great Lakes State" },
  { name: "Minnesota", code: "MN", slug: "minnesota", capital: "Saint Paul", stateFlower: "Pink and White Lady's Slipper", flowerDesc: "A rare native orchid protected by state law.", nickname: "The North Star State" },
  { name: "Mississippi", code: "MS", slug: "mississippi", capital: "Jackson", stateFlower: "Magnolia", flowerDesc: "The iconic large, fragrant bloom of the Southern magnolia.", nickname: "The Magnolia State" },
  { name: "Missouri", code: "MO", slug: "missouri", capital: "Jefferson City", stateFlower: "Hawthorn", flowerDesc: "Small white clusters on thorny shrubs, turning to red berries.", nickname: "The Show-Me State" },
  { name: "Montana", code: "MT", slug: "montana", capital: "Helena", stateFlower: "Bitterroot", flowerDesc: "Pink star-shaped flowers growing from rocky alpine soil.", nickname: "The Treasure State" },
  { name: "Nebraska", code: "NE", slug: "nebraska", capital: "Lincoln", stateFlower: "Goldenrod", flowerDesc: "Bright golden clusters blooming late summer to fall.", nickname: "The Cornhusker State" },
  { name: "Nevada", code: "NV", slug: "nevada", capital: "Carson City", stateFlower: "Sagebrush", flowerDesc: "Silver-green desert shrub with tiny yellow flowers.", nickname: "The Silver State" },
  { name: "New Hampshire", code: "NH", slug: "new-hampshire", capital: "Concord", stateFlower: "Purple Lilac", flowerDesc: "Fragrant clusters of purple lilacs that bloom in May.", nickname: "The Granite State" },
  { name: "New Jersey", code: "NJ", slug: "new-jersey", capital: "Trenton", stateFlower: "Violet", flowerDesc: "Classic purple meadow wildflower.", nickname: "The Garden State" },
  { name: "New Mexico", code: "NM", slug: "new-mexico", capital: "Santa Fe", stateFlower: "Yucca", flowerDesc: "Tall spikes of creamy white bell-shaped flowers.", nickname: "The Land of Enchantment" },
  { name: "New York", code: "NY", slug: "new-york", capital: "Albany", stateFlower: "Rose", flowerDesc: "The rose in all colors — official state flower since 1955.", nickname: "The Empire State" },
  { name: "North Carolina", code: "NC", slug: "north-carolina", capital: "Raleigh", stateFlower: "Flowering Dogwood", flowerDesc: "Four-petaled white (and sometimes pink) spring blooms.", nickname: "The Tar Heel State" },
  { name: "North Dakota", code: "ND", slug: "north-dakota", capital: "Bismarck", stateFlower: "Wild Prairie Rose", flowerDesc: "Pink five-petaled rose of the northern prairies.", nickname: "The Peace Garden State" },
  { name: "Ohio", code: "OH", slug: "ohio", capital: "Columbus", stateFlower: "Scarlet Carnation", flowerDesc: "Deep red carnation, symbol of William McKinley.", nickname: "The Buckeye State" },
  { name: "Oklahoma", code: "OK", slug: "oklahoma", capital: "Oklahoma City", stateFlower: "Oklahoma Rose", flowerDesc: "A hybrid rose bred for Oklahoma in 1964.", nickname: "The Sooner State" },
  { name: "Oregon", code: "OR", slug: "oregon", capital: "Salem", stateFlower: "Oregon Grape", flowerDesc: "Yellow flowers followed by blue berries.", nickname: "The Beaver State" },
  { name: "Pennsylvania", code: "PA", slug: "pennsylvania", capital: "Harrisburg", stateFlower: "Mountain Laurel", flowerDesc: "Clusters of pink-white bell-shaped blooms.", nickname: "The Keystone State" },
  { name: "Rhode Island", code: "RI", slug: "rhode-island", capital: "Providence", stateFlower: "Violet", flowerDesc: "Small purple wildflower widespread in New England.", nickname: "The Ocean State" },
  { name: "South Carolina", code: "SC", slug: "south-carolina", capital: "Columbia", stateFlower: "Yellow Jessamine", flowerDesc: "Fragrant yellow trumpet-shaped vine flowers.", nickname: "The Palmetto State" },
  { name: "South Dakota", code: "SD", slug: "south-dakota", capital: "Pierre", stateFlower: "American Pasque Flower", flowerDesc: "Lavender-purple flower blooming on the spring prairie.", nickname: "The Mount Rushmore State" },
  { name: "Tennessee", code: "TN", slug: "tennessee", capital: "Nashville", stateFlower: "Iris", flowerDesc: "Purple iris flowers native to Tennessee's fields.", nickname: "The Volunteer State" },
  { name: "Texas", code: "TX", slug: "texas", capital: "Austin", stateFlower: "Bluebonnet", flowerDesc: "Blue wildflower that carpets Texas highways each spring.", nickname: "The Lone Star State" },
  { name: "Utah", code: "UT", slug: "utah", capital: "Salt Lake City", stateFlower: "Sego Lily", flowerDesc: "Delicate white bell-shaped flowers with yellow centers.", nickname: "The Beehive State" },
  { name: "Vermont", code: "VT", slug: "vermont", capital: "Montpelier", stateFlower: "Red Clover", flowerDesc: "Pink-purple clover blossoms beloved by bees.", nickname: "The Green Mountain State" },
  { name: "Virginia", code: "VA", slug: "virginia", capital: "Richmond", stateFlower: "American Dogwood", flowerDesc: "Four-bracted spring flower, usually white or pink.", nickname: "The Old Dominion" },
  { name: "Washington", code: "WA", slug: "washington", capital: "Olympia", stateFlower: "Coast Rhododendron", flowerDesc: "Pink mountain rhododendron that blooms in forests.", nickname: "The Evergreen State" },
  { name: "West Virginia", code: "WV", slug: "west-virginia", capital: "Charleston", stateFlower: "Rhododendron", flowerDesc: "Pink-purple flower clusters on broad-leaved shrubs.", nickname: "The Mountain State" },
  { name: "Wisconsin", code: "WI", slug: "wisconsin", capital: "Madison", stateFlower: "Wood Violet", flowerDesc: "Small purple woodland wildflower.", nickname: "The Badger State" },
  { name: "Wyoming", code: "WY", slug: "wyoming", capital: "Cheyenne", stateFlower: "Indian Paintbrush", flowerDesc: "Flame-orange wildflower of mountain meadows.", nickname: "The Equality State" },
  { name: "District of Columbia", code: "DC", slug: "district-of-columbia", capital: "Washington", stateFlower: "American Beauty Rose", flowerDesc: "A classic red hybrid rose, symbol of the nation's capital.", nickname: "DC" },
];

export function findStateByCode(code: string): USState | undefined {
  return US_STATES.find((s) => s.code === code.toUpperCase());
}

export function findStateBySlug(slug: string): USState | undefined {
  return US_STATES.find((s) => s.slug === slug.toLowerCase());
}
