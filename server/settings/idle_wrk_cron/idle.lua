-- код для не давать виртуалке застыть

counter = 0

query_a = {
"1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
"q","w","e","r","t","y","u","i","o","p",
"a","s","d","f","g","h","j","k","l",
"z","x","c","v","b","n","m",

"%D0%B0","%D0%B1","%D0%B2","%D0%B3","%D0%B4","%D0%B5","%D0%B6","%D0%B7",
"%D0%B8","%D0%B9","%D0%BA","%D0%BB","%D0%BC","%D0%BD","%D0%BE","%D0%BF",

"%D1%80","%D1%81","%D1%82","%D1%83","%D1%84","%D1%85","%D1%86","%D1%87",
"%D1%88","%D1%89","%D1%8A","%D1%8B","%D1%8C","%D1%8D","%D1%8E","%D1%8F",

"Q","W","E","R","T","Y","U","I","O","P",
"A","S","D","F","G","H","J","K","L",
"Z","X","C","V","B","N","M",


"%D0%90","%D0%91","%D0%92","%D0%93","%D0%94","%D0%95","%D0%96","%D0%97",
"%D0%98","%D0%99","%D0%9A","%D0%9B","%D0%9C","%D0%9D","%D0%9E","%D0%9F",

"%D0%A0","%D0%A1","%D0%A2","%D0%A3","%D0%A4","%D0%A5","%D0%A6","%D0%A7",
"%D0%A8","%D0%A9","%D0%AA","%D0%AB","%D0%AC","%D0%AD","%D0%AE","%D0%AF"
}

ru_sym = {
"%D0%B0","%D0%B1","%D0%B2","%D0%B3","%D0%B4","%D0%B5","%D0%B6","%D0%B7",
"%D0%B8","%D0%B9","%D0%BA","%D0%BB","%D0%BC","%D0%BD","%D0%BE","%D0%BF",

"%D1%80","%D1%81","%D1%82","%D1%83","%D1%84","%D1%85","%D1%86","%D1%87",
"%D1%88","%D1%89","%D1%8A","%D1%8B","%D1%8C","%D1%8D","%D1%8E","%D1%8F"
}

en_sym = {
"1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
"q","w","e","r","t","y","u","i","o","p",
"a","s","d","f","g","h","j","k","l",
"z","x","c","v","b","n","m"
}


cache = {}
for i=1,#ru_sym,1 do
  for j=1,#ru_sym,1 do
      
    cache[#cache + 1] = ru_sym[i]..ru_sym[j]
    if #cache == 5 then
      --print(table.concat(cache, "%20")..' -- ')
      query_a[#query_a + 1] = table.concat(cache, "%20")
      cache = {}
    end  
  end  
end

query_a[#query_a + 1] = table.concat(cache, "%20")
cache = {}



cache = {}
for i=1,#en_sym,1 do
  for j=1,#en_sym,1 do
      
    cache[#cache + 1] = en_sym[i]..en_sym[j]
    if #cache == 5 then
      --print(table.concat(cache, "%20")..' -- ')
      query_a[#query_a + 1] = table.concat(cache, "%20")
      cache = {}
    end  
  end  
end

query_a[#query_a + 1] = table.concat(cache, "%20")
cache = {}



-- print(#query_a)

-- [[

request = function()
   path = "/search/query?qs=" .. query_a[(counter % (#query_a)) + 1]
   counter = counter + 1
   return wrk.format(nil, path)
end

--]]
