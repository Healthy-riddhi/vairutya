# Skin quiz emails for Brevo: one automation, five emails

## The automation

1. **Entry point:** Contact is added to a list, and select **all seven** lists: Skin quiz – Vata, Skin quiz – Pitta, Skin quiz – Kapha, Skin quiz – Vata-Pitta, Skin quiz – Vata-Kapha, Skin quiz – Pitta-Kapha, Skin quiz – Tridoshic.
2. Then, in this order (each wait counts from the previous email):

| Email | Wait before | Sent on day | HTML file to paste | Subject line to type |
|---|---|---|---|---|
| 1 | 3 days | 3 | skin-email-1-day3.html | {{ contact.SKIN_SUBJECT_1 }} |
| 2 | 4 days | 7 | skin-email-2-day7.html | {{ contact.SKIN_SUBJECT_2 }} |
| 3 | 3 days | 10 | skin-email-3-day10.html | {{ contact.SKIN_SUBJECT_3 }} |
| 4 | 4 days | 14 | skin-email-4-day14.html | {{ contact.SKIN_SUBJECT_4 }} |
| 5 | 7 days | 21 | skin-email-5-day21.html | {{ contact.SKIN_SUBJECT_5 }} |

In each **Send an email** step: paste the HTML file into the HTML custom code editor, type the subject line exactly as shown
(Brevo fills it in from each person's contact), choose your sender, then use **Preview & test**.

When you activate the automation, tick **Re-entry after exit** if you see it.

## What each person gets

### Vata
1. Deep dive: Why your skin craves moisture (The Vata Element explained)
2. Nourish from within: A grounding recipe for glowing Vata skin
3. The ultimate Vata ritual: The art of Abhyanga (Self-Oil Massage)
4. Gentle movement to awaken circulation in Vata skin
5. Bringing it all together: Your daily Vata sanctuary

### Pitta
1. Deep dive: Why your skin craves calm (The Pitta Element explained)
2. Cool from within: A soothing recipe for calm, clear Pitta skin
3. The ultimate Pitta ritual: Cooling Abhyanga & Rosewater Calm
4. Cooling movement & breathwork for reactive Pitta skin
5. Bringing it all together: Your serene Pitta sanctuary

### Kapha
1. Deep dive: Why your skin craves stimulation (The Kapha Element explained)
2. Lighten from within: A stimulating recipe for clear Kapha skin
3. The ultimate Kapha ritual: Udwartana (Energizing Herbal Scrubbing)
4. Invigorating movement & breathwork to awaken Kapha skin
5. Bringing it all together: Your vibrant Kapha sanctuary

### Vata-Pitta
1. Deep dive: Balancing wind & fire (Your Vata-Pitta Skin explained)
2. Hydrate & cool from within: A soothing recipe for Vata-Pitta skin
3. The ultimate Vata-Pitta ritual: Rosewater & Sweet Almond Seal
4. Grounded, cooling movement for Vata-Pitta skin
5. Bringing it all together: Your calm Vata-Pitta sanctuary

### Vata-Kapha
1. Deep dive: Balancing dryness & heaviness (Your Vata-Kapha Skin explained)
2. Warm & stimulate from within: A balancing recipe for Vata-Kapha skin
3. The ultimate Vata-Kapha ritual: Targeted Udwartana & Warm Oil Care
4. Awakening movement & breathwork for Vata-Kapha skin
5. Bringing it all together: Your balanced Vata-Kapha sanctuary

### Pitta-Kapha
1. Deep dive: Balancing heat & congestion (Your Pitta-Kapha Skin explained)
2. Cool & clarify from within: A purifying recipe for Pitta-Kapha skin
3. The ultimate Pitta-Kapha ritual: Cooling Herbal Udwartana
4. Calming, non-overheating movement for Pitta-Kapha skin
5. Bringing it all together: Your clear Pitta-Kapha sanctuary

### Tridoshic
1. Deep dive: The rare gift of Tridoshik balance (Your skin explained)
2. Eat for the season: Maintaining your Tridoshik glow from within
3. The ultimate Tridoshik ritual: Balanced Abhyanga & Mindful Nourishment
4. Harmonious movement & breathwork for Tridoshik vitality
5. Bringing it all together: Your lifelong Tridoshik sanctuary
