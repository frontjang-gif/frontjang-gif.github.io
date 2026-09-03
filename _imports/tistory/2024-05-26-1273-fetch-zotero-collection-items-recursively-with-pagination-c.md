---
title: "Fetch Zotero collection items recursively with pagination (C#)"
date: 2024-05-26
migration_status: review_required
original_url: https://frontjang1.tistory.com/1273
tistory_category: {"id": 1176543, "label": "Script"}
---

<!-- Review category, canonical metadata, and media before moving this draft into _posts/. -->

Script
using System.Linq;
string url = "https://api.zotero.org/users/<userID>/collections/GDRUMMLB/items/top";
string responseText = string.Empty;
while (true) {
HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
request.Method = "GET";
request.Headers.Add("Zotero-API-Version", "3");
request.Headers.Add("Zotero-API-Key", "<apiKey>");
using (WebResponse resp = request.GetResponse())
{
var links = new Dictionary<string, string>();
var linkHeader = resp.Headers.GetValues("Link");
var matches = Regex.Matches(linkHeader[0], @"<(?<url>[^>]*)>;\s+rel=""(?<link>\w+)\""");
foreach (Match m in matches)
links.Add(m.Groups["link"].Value, m.Groups["url"].Value);
//links.Select(i => $"{i.Key}: {i.Value}").ToList().ForEach(Console.WriteLine);
Stream respStream = resp.GetResponseStream();
using (StreamReader sr = new StreamReader(respStream))
{
responseText += sr.ReadToEnd();
}
if (!links.ContainsKey("next"))
{
break;
}
else
{
url=links["next"];
System.Threading.Thread.Sleep(1000);
}
}
}
Console.WriteLine(responseText);
File.WriteAllText("c:\\temp\\output.json", responseText.Replace("][",","));
