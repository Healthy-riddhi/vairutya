/**
 * The skin-quiz follow-up emails: five per skin type, in English.
 * Written by Riddhi. To change the wording, edit the text below; nothing else needs touching.
 *
 * - The greeting ("Dear Priya,") and sign-off are added around
 *   these blocks by skin-drip-emails.ts.
 * - Text between **double asterisks** is shown in bold.
 * - Each email goes out on a fixed day after the quiz (day 3, 7, 10, 14, 21). Those days are set in
 *   Strapi (src/utils/quiz-drip.ts, DAYS), not here.
 */

export type SkinSequence =
  | "vata"
  | "pitta"
  | "kapha"
  | "vata-pitta"
  | "vata-kapha"
  | "pitta-kapha"
  | "tridoshic";

export type DripBlock = { p: string } | { ul: string[] } | { ol: string[] };

export type DripEmail = {
  /** 1 to 5 */
  step: number;
  subject: string;
  /** The short preview shown beside the subject in the inbox. */
  preview: string;
  blocks: DripBlock[];
};

export const SKIN_SEQUENCES: Record<SkinSequence, DripEmail[]> = {
  "vata": [
    {
      "step": 1,
      "subject": "Deep dive: Why your skin craves moisture (The Vata Element explained)",
      "preview": "Moving beyond surface-level dryness to understand your Air + Ether constitution.",
      "blocks": [
        {
          "p": "When you took your skin profile quiz on Vairutya, you discovered that your skin is **Vata-dominant (Air + Ether)**. While the results page touched on your main skin challenges like dryness and irregular circulation, today we want to look at why this happens."
        },
        {
          "p": "In Ayurveda, skin is a direct reflection of your internal elements. Because Vata is governed by light, cold, and mobile qualities (Air and Ether), your skin barrier naturally tends to lose moisture faster than other doshas. When cold winds pick up, stress rises, or routines fluctuate, your skin is usually the first to signal it through tightness, flakiness, or dullness."
        },
        {
          "p": "**The Anti-Confusion Shift:**"
        },
        {
          "p": "Most commercial skincare tries to fix Vata dryness by adding heavier chemical moisturizers on top. Ayurvedic wisdom takes a different approach: **we balance dry air with warmth, healthy fats, and deep internal grounding.**"
        },
        {
          "p": "Over the next few weeks, we’ll be guiding you step-by-step through specific nourishing recipes, self-care rituals, and breathwork practices tailored precisely to wrap your Vata skin in warmth and protection."
        }
      ]
    },
    {
      "step": 2,
      "subject": "Nourish from within: A grounding recipe for glowing Vata skin",
      "preview": "Swap cold salads for warming, moisture-locking meals your skin will thank you for.",
      "blocks": [
        {
          "p": "As noted in your Vata skin profile, your internal digestion and circulation play a massive role in how radiant your skin feels. When we eat raw, cold, or dry foods, it aggravates the Air element internally—manifesting as dehydration on the surface."
        },
        {
          "p": "To restore a dewy, plump glow, your skin thrives on **warm, moist, and grounding meals**."
        },
        {
          "p": "**Try This Week: Golden Carrot & Ginger Coconut Stew**"
        },
        {
          "ul": [
            "**Why it works:** Root vegetables grown underground (like carrots and sweet potatoes) carry earthy, grounding energy that pacifies Vata. Combined with healthy fats like pure cow’s ghee or coconut milk, it delivers deep internal lubrication to dry skin tissues."
          ]
        },
        {
          "ul": [
            "**The Ritual:** Enjoy this bowl warm, seasoned with a pinch of black pepper and freshly grated ginger to ignite your digestive fire (agni) and boost micro-circulation to your face."
          ]
        },
        {
          "p": "Skip the raw salads and iced drinks this week, and notice how much softer and more settled your skin feels from the inside out."
        }
      ]
    },
    {
      "step": 3,
      "subject": "The ultimate Vata ritual: The art of Abhyanga (Self-Oil Massage)",
      "preview": "Lock in deep moisture and calm your nervous system with this ancient practice.",
      "blocks": [
        {
          "p": "If you could only adopt one ritual for your Vata skin constitution, **Abhyanga** (warm oil self-massage) should be it."
        },
        {
          "p": "Because Vata skin lacks natural oil production and reacts strongly to stress and cold, topical creams often only scratch the surface. Massaging warm, nourishing oil into your skin before a bath creates a protective, insulating shield against the elements while calming the nervous system."
        },
        {
          "p": "**How to Practice Vata Abhyanga:**"
        },
        {
          "ol": [
            "**Warm the Oil:** Take organic sesame oil or almond oil and warm it gently in a small bowl of hot water.",
            "**Long Strokes:** Massage the oil into your body and face using long, sweeping strokes over your limbs and circular motions over your joints.",
            "**The Pause:** Let the warm oil sink in for 5 to 10 minutes while you sip warm herbal tea.",
            "**Rinse:** Step into a warm bath or shower (avoid harsh soaps). Pat dry gently, leaving a microscopic layer of moisture locked into your skin."
          ]
        },
        {
          "p": "Your skin will instantly respond with a soft, nourished elasticity that commercial lotions simply cannot replicate."
        }
      ]
    },
    {
      "step": 4,
      "subject": "Gentle movement to awaken circulation in Vata skin",
      "preview": "Why high-intensity workouts can deplete your glow—and what to do instead.",
      "blocks": [
        {
          "p": "When poor circulation or sluggish energy leaves your skin looking tired or pale, the instinct is often to hit the gym hard. However, for Vata types, high-intensity, fast-paced cardio can actually increase internal dryness and deplete your vitality."
        },
        {
          "p": "Vata skin responds best to **gentle, steady movement** that builds internal heat without scattering your energy."
        },
        {
          "p": "**Your Skin-Loving Movement Guide:**"
        },
        {
          "ul": [
            "**Hatha Yoga & Grounding Asanas:** Poses that keep you low to the ground—like Child’s Pose (Balasana), Seated Forward Folds, and gentle spinal twists—massage internal organs and direct blood flow directly to the facial tissues."
          ]
        },
        {
          "ul": [
            "**Anulom Vilom (Alternate Nostril Breathing):** Spend 5 minutes daily on this calming pranayama. By balancing your nervous system, you instantly lower stress-induced skin inflammation and dryness."
          ]
        },
        {
          "p": "Pair your practice with a quiet moment sitting on your favorite meditation asana, letting your breath anchor your mind and body."
        }
      ]
    },
    {
      "step": 5,
      "subject": "Bringing it all together: Your daily Vata sanctuary",
      "preview": "Create a consistent daily rhythm (Dinacharya) to keep your skin radiant all year round.",
      "blocks": [
        {
          "p": "Over the past three weeks, we’ve explored how your Vata skin profile thrives on warmth, grounding nourishment, loving oil rituals, and steady breath."
        },
        {
          "p": "The secret to maintaining these results isn't perfection—it is **consistency** (Dinacharya). Vata energy is naturally erratic, meaning irregular sleep schedules, skipped meals, and rushed routines will instantly show up on your skin."
        },
        {
          "p": "**Your Anchor for Sustainable Radiance:**"
        },
        {
          "ul": [
            "Keep fixed times for waking up, eating your warm meals, and winding down in the evening."
          ]
        },
        {
          "ul": [
            "Create a dedicated sacred corner in your home with your meditation mat and journals, where you can pause, breathe, and reconnect with your center every single day."
          ]
        },
        {
          "p": "Thank you for letting us guide you on your conscious living journey. If you ever want to re-take the quiz or explore our artisanal Vairutya collection, our studio doors are always open."
        }
      ]
    }
  ],
  "pitta": [
    {
      "step": 1,
      "subject": "Deep dive: Why your skin craves calm (The Pitta Element explained)",
      "preview": "Moving beyond surface redness and breakouts to understand your Fire + Water constitution.",
      "blocks": [
        {
          "p": "Your skin profile quiz on Vairutya revealed that your skin is **Pitta-dominant (Fire + Water)**. While your natural constitution blesses you with a warm, rosy luminosity and sharp vitality, Pitta skin is also the most reactive and sensitive when out of balance."
        },
        {
          "p": "In Ayurveda, Pitta governs heat, transformation, and metabolism. When internal heat builds up—whether from spicy foods, midday sun, intense deadlines, or harsh active skincare acids—it looks for an exit route. For Pitta types, that exit route is almost always the skin, showing up as redness, inflammation, breakouts, or sun sensitivity."
        },
        {
          "p": "**The Anti-Confusion Shift:** Modern skincare often treats Pitta breakouts and sensitivity with aggressive exfoliants, peels, and drying spot treatments—which essentially pours more fire onto fire. Ayurvedic wisdom does the exact opposite: **we calm reactive skin with cooling nourishment, gentle anti-inflammatory botanicals, and emotional stillness.**"
        },
        {
          "p": "Over the next few weeks, we’ll guide you step-by-step through cooling recipes, soothing evening rituals, and breathwork practices designed specifically to keep your Pitta glow serene and balanced."
        }
      ]
    },
    {
      "step": 2,
      "subject": "Cool from within: A soothing recipe for calm, clear Pitta skin",
      "preview": "Swap fiery spices and acidic foods for sweet, hydrating nourishment your skin loves.",
      "blocks": [
        {
          "p": "For Pitta-dominant skin, what happens in your stomach shows up on your face within hours. Excessively spicy, sour, fermented, or fried foods directly stoke your internal digestive fire (agni), leading to heat-induced flushing, irritation, and blemishes."
        },
        {
          "p": "To keep your complexion clear and even-toned, your skin thrives on **sweet, bitter, and astringent flavors** paired with naturally cooling hydration."
        },
        {
          "p": "**Try This Week: Coconut, Cucumber & Mint Cooling Elixir Bowl**"
        },
        {
          "ul": [
            "**Why it works:** Cucumber and fresh coconut are two of Ayurveda’s premier natural coolants, pulling excess heat out of the blood and liver (Rakta Dhatu, the tissue directly responsible for skin clarity). Fresh mint and coriander calm digestion without generating heat."
          ]
        },
        {
          "ul": [
            "**The Ritual:** Blend peeled cucumber, tender coconut water, fresh mint leaves, a handful of soaked pumpkin seeds, and a pinch of roasted cumin powder into a chilled-at-room-temperature gazpacho. Drizzle with a teaspoon of pure cow’s ghee or cold-pressed coconut oil."
          ]
        },
        {
          "p": "Skip raw onions, chilies, and extra coffee this week, and notice how much calmer and brighter your skin looks by Sunday."
        }
      ]
    },
    {
      "step": 3,
      "subject": "The ultimate Pitta ritual: Cooling Abhyanga & Rosewater Calm",
      "preview": "How to soothe inflamed, reactive skin without clogging pores or trapping heat.",
      "blocks": [
        {
          "p": "Pitta skin often shies away from facial oils out of fear of breakouts—yet skipping nourishment leaves the skin barrier vulnerable and easily irritated. The secret lies in choosing **cooling, lightweight oils** and pairing them with calming floral hydrosols."
        },
        {
          "p": "**How to Practice the Pitta Evening Cool-Down Ritual:**"
        },
        {
          "ol": [
            "**Mist First:** Before applying anything, mist your clean face generously with pure, steam-distilled **edible rosewater** (Gulab Jal) to immediately lower skin surface temperature.",
            "**Cooling Oil Application:** Warm just 2–3 drops of cold-pressed **coconut oil** or **sunflower oil** between your fingertips (avoid warming sesame or mustard oils, which hold too much heat for Pitta).",
            "**Gentle Touch:** Press—don't rub—the oil gently into damp skin using upward, featherlight strokes. Over-massaging generates friction and heat; Pitta skin responds best to a soft, unhurried touch.",
            "**Nighttime Reset:** Rinse with cool or lukewarm water—never hot—to protect delicate capillaries and preserve your natural lipid barrier."
          ]
        }
      ]
    },
    {
      "step": 4,
      "subject": "Cooling movement & breathwork for reactive Pitta skin",
      "preview": "Release trapped heat and perfectionist tension with Sheetali breath and gentle flow.",
      "blocks": [
        {
          "p": "Pitta types are natural achievers—drawn to intense workouts, hot yoga, and pushing limits. Yet exercising during peak midday heat or pushing into exhaustion floods the body with cortisol and internal heat, triggering redness and flare-ups."
        },
        {
          "p": "Your skin glows brightest when movement feels **fluid, non-competitive, and cooling**."
        },
        {
          "p": "**Your Skin-Soothing Practice:**"
        },
        {
          "ul": [
            "**Moon Salutations (Chandra Namaskar):** Unlike energizing Sun Salutations, Moon Salutations cool the body, open the hips and chest, and release stored tension without overheating your system."
          ]
        },
        {
          "ul": [
            "**Sheetali Pranayama (The Cooling Breath):** Sit comfortably on your meditation mat, curl your tongue into a tube (or gently part your teeth), inhale slowly as if sipping cool air through a straw, and exhale through your nose. Repeat for 7–10 rounds whenever your skin feels flushed or your mind feels overheated."
          ]
        }
      ]
    },
    {
      "step": 5,
      "subject": "Bringing it all together: Your serene Pitta sanctuary",
      "preview": "Trade hustle for unhurried presence—the real secret behind effortless Pitta radiance.",
      "blocks": [
        {
          "p": "Over the past three weeks, we’ve explored how your Pitta skin profile thrives when excess fire is gently cooled—through hydrating foods, featherlight rosewater rituals, and cooling breathwork."
        },
        {
          "p": "Ultimately, Pitta skin reflects your relationship with rest. When you give yourself permission to slow down, step away from screens before bed, and enjoy unhurried evening rituals, your skin stops working overtime to release internal stress."
        },
        {
          "p": "**Your Anchor for Lasting Clarity:**"
        },
        {
          "ul": [
            "Protect your evenings from bright screens and intense work—let dusk be your natural cue to cool down."
          ]
        },
        {
          "ul": [
            "Step onto your meditation mat for just five quiet minutes of Sheetali breath before sleep, allowing your nervous system and complexion to reset overnight."
          ]
        },
        {
          "p": "Thank you for walking this conscious path with us. Whenever you’re ready to explore Vairutya’s curated rituals and artisanal essentials, our studio is here to support you."
        }
      ]
    }
  ],
  "kapha": [
    {
      "step": 1,
      "subject": "Deep dive: Why your skin craves stimulation (The Kapha Element explained)",
      "preview": "Moving beyond surface oiliness and congestion to understand your Earth + Water constitution.",
      "blocks": [
        {
          "p": "Your skin profile quiz on Vairutya revealed that your skin is **Kapha-dominant (Earth + Water)**. While your natural blessing is thick, resilient skin that resists fine lines and premature aging, Kapha skin can easily become sluggish, cool, and congested when out of balance."
        },
        {
          "p": "In Ayurveda, Kapha governs structure, lubrication, and cohesion. Because Earth and Water are heavy, dense, and cool elements, excess Kapha leads to slow circulation, trapped lymphatic fluids, enlarged pores, thick sebum, and a dull or puffy appearance—especially upon waking."
        },
        {
          "p": "**The Anti-Confusion Shift:** Modern skincare often tackles oily, congested skin with harsh alcohol toners and stripping chemicals that damage the skin barrier while signaling glands to produce more oil. Ayurvedic wisdom takes the opposite approach: **we stimulate sluggish circulation, clear congestion with warm, drying botanicals, and invigorate the skin tissue from within.**"
        },
        {
          "p": "Over the next few weeks, we’ll guide you step-by-step through stimulating recipes, dry exfoliating rituals, and breathwork practices designed to awaken your skin's natural radiance."
        }
      ]
    },
    {
      "step": 2,
      "subject": "Lighten from within: A stimulating recipe for clear Kapha skin",
      "preview": "Swap heavy, oily, and sweet foods for warming, pungent spices that melt congestion.",
      "blocks": [
        {
          "p": "Kapha skin is heavily influenced by heavy, cold, and sweet foods. Dairy, cold desserts, heavy oils, and iced drinks slow down your digestive fire (agni), producing excess mucus and sluggish metabolic waste (ama) that settles directly into skin tissues as congestion and dullness."
        },
        {
          "p": "To keep your complexion light and clear, your skin thrives on **pungent, bitter, and astringent flavors** paired with warming spices."
        },
        {
          "p": "**Try This Week: Spiced Roasted Root Vegetables with Turmeric & Black Pepper**"
        },
        {
          "ul": [
            "**Why it works:** Spices like ginger, black pepper, cinnamon, and turmeric act as natural internal decongestants. They boost micro-circulation, thin out stagnant lymphatic fluids, and fire up your metabolism to clear dull skin from the inside out."
          ]
        },
        {
          "ul": [
            "**The Ritual:** Roast bitter greens (like methi or spinach) and root vegetables tossed in mustard oil or a tiny touch of ghee, heavily spiced with cumin, turmeric, and fresh ginger."
          ]
        },
        {
          "p": "Skip dairy, heavy cheeses, and sugary snacks this week, and notice how much lighter and more clarified your skin feels."
        }
      ]
    },
    {
      "step": 3,
      "subject": "The ultimate Kapha ritual: Udwartana (Energizing Herbal Scrubbing)",
      "preview": "How to stimulate lymphatic drainage and melt away sluggishness with dry herbal powders.",
      "blocks": [
        {
          "p": "Because Kapha skin tends to retain fluid and hold onto dead skin cells, standard moisturizing lotions and heavy oils will only weigh your skin down. Your skin responds best to **dry, stimulating exfoliation**."
        },
        {
          "p": "In Ayurveda, the premier ritual for Kapha imbalance is **Udwartana**—an invigorating massage using dry herbal powders rather than oil."
        },
        {
          "p": "**How to Practice Kapha Herbal Scrubbing:**"
        },
        {
          "ol": [
            "**The Blend:** Mix chickpea flour (besan) or masoor dal flour with a pinch of turmeric and dry ginger powder.",
            "**Firm Upward Strokes:** Apply the dry or lightly dampened powder to your skin, massaging firmly in **upward strokes against the direction of hair growth**. This creates friction that warms the tissue, breaks down superficial fat deposits, and opens blocked pores.",
            "**Rinse & Stimulate:** Rinse off with warm water to leave your skin feeling remarkably light, smooth, and deeply energized."
          ]
        }
      ]
    },
    {
      "step": 4,
      "subject": "Invigorating movement & breathwork to awaken Kapha skin",
      "preview": "Shake off morning heaviness with Kapalabhati breath and dynamic movement.",
      "blocks": [
        {
          "p": "Kapha types naturally love comfort, rest, and cozy routines. But when morning lethargy sets in, staying sedentary traps lymphatic fluid, making puffiness and dullness linger on your face all day."
        },
        {
          "p": "Your skin glows brightest when you introduce **dynamic heat and invigorating breath**."
        },
        {
          "p": "**Your Skin-Awakening Practice:**"
        },
        {
          "ul": [
            "**Dynamic Vinyasa Flow:** Fast-paced sun salutations that build a strong sweat help flush out cellular waste through your pores, instantly brightening a dull complexion."
          ]
        },
        {
          "ul": [
            "**Kapalabhati (Skull-Shining Breath):** Sit tall on your meditation mat, take a deep breath in, and begin sharp, active exhalations by snapping your navel inward. Spend 3 minutes each morning on Kapalabhati to stoke your internal furnace, clear upper respiratory passages, and bring a natural, rosy flush to your cheeks."
          ]
        }
      ]
    },
    {
      "step": 5,
      "subject": "Bringing it all together: Your vibrant Kapha sanctuary",
      "preview": "Trade stagnation for daily inspiration—the secret to lasting Kapha radiance.",
      "blocks": [
        {
          "p": "Over the past three weeks, we’ve explored how your Kapha skin profile thrives when stagnation is met with stimulation—through warming spices, herbal dry scrubbing, and dynamic breathwork."
        },
        {
          "p": "The true antidote to Kapha heaviness is **variety and momentum**. By keeping your mornings active, trying new recipes, and avoiding heavy inertia, your skin maintains a clear, glowing vitality."
        },
        {
          "p": "**Your Anchor for Lasting Clarity:**"
        },
        {
          "ul": [
            "Wake up early before the sun (ideally during Brahmamuhurta or early morning) to beat natural sluggishness."
          ]
        },
        {
          "ul": [
            "Step onto your meditation mat for a quick round of energizing breathwork before starting your day, anchoring your mind in lightness and purpose."
          ]
        },
        {
          "p": "Thank you for walking this conscious path with us. Whenever you’re ready to explore Vairutya’s botanical scrubs and artisanal essentials, our studio is here to support you."
        }
      ]
    }
  ],
  "vata-pitta": [
    {
      "step": 1,
      "subject": "Deep dive: Balancing wind & fire (Your Vata-Pitta Skin explained)",
      "preview": "Why your skin feels both dehydrated and easily irritated—and how to calm both at once.",
      "blocks": [
        {
          "p": "Your skin profile quiz on Vairutya revealed that your skin is **Vata-Pitta (Air + Fire)**. Think of this combination like wind fanning a flame: Vata brings dryness, fine lines, and barrier fragility, while Pitta brings sensitivity, redness, and sudden flare-ups."
        },
        {
          "p": "Because both elements are light and mobile, Vata-Pitta skin reacts quickly to shifts in weather, travel, stress, and harsh skincare. One day your skin feels tight and parched; the next, it feels flushed or irritated by a product that felt fine yesterday."
        },
        {
          "p": "**The Anti-Confusion Shift:** Standard routines force you to choose between heavy creams for dryness (which trap Pitta heat and trigger breakouts) or drying acne products for sensitivity (which strip Vata moisture). Ayurvedic wisdom bridges both worlds: **we feed your skin cooling, deeply hydrating nourishment that calms inflammation while rebuilding your lipid barrier.**"
        },
        {
          "p": "Over the next few weeks, we’ll guide you through sweet, cooling recipes, gentle oil-and-hydrosol rituals, and grounding breathwork made specifically for your dual constitution."
        }
      ]
    },
    {
      "step": 2,
      "subject": "Hydrate & cool from within: A soothing recipe for Vata-Pitta skin",
      "preview": "Why sweet, juicy, grounding foods are the ultimate medicine for wind-and-fire skin.",
      "blocks": [
        {
          "p": "For Vata-Pitta skin, digestion is everything. Skip a meal and Vata creates internal dryness; eat something overly spicy, sour, or fried and Pitta sparks immediate facial redness."
        },
        {
          "p": "Your complexion thrives on **sweet, cooling, and unctuous (naturally moist) foods**—flavors that ground scattered air while gently extinguishing excess heat."
        },
        {
          "p": "**Try This Week: Cardamom & Rose Stewed Pears with Ghee**"
        },
        {
          "ul": [
            "**Why it works:** Cooked pears are deeply hydrating and easy on sensitive digestion, pacifying Vata dryness without feeling heavy. Pure cow’s ghee delivers cooling healthy fats directly to skin tissues, while crushed green cardamom and dried rose petals soothe Pitta heat."
          ]
        },
        {
          "ul": [
            "**The Ritual:** Gently simmer sliced ripe pears in a splash of water with a teaspoon of pure ghee, crushed cardamom pods, and a pinch of edible rose petals until tender. Enjoy warm as a nourishing breakfast or afternoon reset."
          ]
        },
        {
          "p": "Minimize raw salads, chilies, and skipped meals this week, and watch your skin barrier visibly soften and calm."
        }
      ]
    },
    {
      "step": 3,
      "subject": "The ultimate Vata-Pitta ritual: Rosewater & Sweet Almond Seal",
      "preview": "How to lock in deep moisture while keeping reactive skin cool and serene.",
      "blocks": [
        {
          "p": "Vata-Pitta skin cannot tolerate aggressive scrubbing, hot water, or heavy warming oils like mustard or raw sesame (which can feel too heating for Pitta). Instead, your skin flourishes with **liquid hydration sealed under a cooling, nutrient-rich oil**."
        },
        {
          "p": "**How to Practice the Vata-Pitta Barrier Ritual:**"
        },
        {
          "ol": [
            "**Drench with Floral Water:** Mist clean, slightly damp skin generously with pure **steam-distilled rosewater** or **vetiver (khus) hydrosol** to flood thirsty Vata cells with cooling moisture.",
            "**Seal with Sweet Almond or Coconut-Jojoba:** Warm 3–4 drops of cold-pressed **sweet almond oil** (rich in soothing vitamin E) between your palms. In warmer months, blend with a drop of fractionated coconut oil.",
            "**Slow, Press-and-Release Touch:** Gently press your palms onto your cheeks, forehead, and neck— holding for a breath at each spot to calm facial tension without creating friction.",
            "**Lukewarm Rinse:** Always cleanse with lukewarm or cool water to keep capillaries calm and intact."
          ]
        }
      ]
    },
    {
      "step": 4,
      "subject": "Grounded, cooling movement for Vata-Pitta skin",
      "preview": "Swap high-stress workouts for steady flow and Nadi Shodhana breathwork.",
      "blocks": [
        {
          "p": "Vata-Pitta individuals often move fast—driven by Pitta ambition and Vata restlessness. Yet pushing through exhausting, high-heat workouts spikes cortisol, depleting your moisture reserves while triggering redness and sensitivity."
        },
        {
          "p": "Your skin glows brightest when movement feels **steady, fluid, and restorative**."
        },
        {
          "p": "**Your Skin-Balancing Practice:**"
        },
        {
          "ul": [
            "**Slow, Grounded Hatha Flow:** Focus on hip-opening and heart-opening postures—like Seated Butterfly (Baddha Konasana), Cobra (Bhujangasana), and Legs-Up-the-Wall (Viparita Karani)—to boost gentle circulation to the face without overheating."
          ]
        },
        {
          "ul": [
            "**Nadi Shodhana (Alternate Nostril Breathing):** Sit comfortably on your meditation mat for 5 minutes each evening. Inhaling through the cooling left nostril (Ida Nadi) and balancing both hemispheres immediately quiets Vata anxiety and cools Pitta intensity."
          ]
        }
      ]
    },
    {
      "step": 5,
      "subject": "Bringing it all together: Your calm Vata-Pitta sanctuary",
      "preview": "Consistency without perfectionism—the secret to effortless Vata-Pitta radiance.",
      "blocks": [
        {
          "p": "Over the past three weeks, we’ve explored how your Vata-Pitta skin thrives when wind and fire are met with steady moisture, cooling nourishment, and gentle touch."
        },
        {
          "p": "The greatest gift you can offer your skin is **unhurried rhythm without rigid perfectionism**. Eating warm, cooling meals on time and protecting your evening wind-down keeps both Vata dryness and Pitta reactivity at bay."
        },
        {
          "p": "**Your Anchor for Lasting Radiance:**"
        },
        {
          "ul": [
            "Keep a bottle of pure rosewater by your desk or bedside to mist away midday dryness and heat."
          ]
        },
        {
          "ul": [
            "Step onto your meditation mat for five quiet minutes of Nadi Shodhana before bed, letting your mind and skin settle into deep restoration."
          ]
        },
        {
          "p": "Thank you for walking this conscious path with us. Whenever you’re ready to explore Vairutya’s artisanal rituals and essentials, our studio doors are always open."
        }
      ]
    }
  ],
  "vata-kapha": [
    {
      "step": 1,
      "subject": "Deep dive: Balancing dryness & heaviness (Your Vata-Kapha Skin explained)",
      "preview": "Why your skin feels dry in some areas and congested in others—and how to harmonize both.",
      "blocks": [
        {
          "p": "Your skin profile quiz on Vairutya revealed that your skin is **Vata-Kapha (Air + Earth)**. This dual constitution brings a fascinating contrast: Vata brings dry, cool, thin areas (often around the cheeks and eyes), while Kapha brings thick, cool, congested areas (often around the T-zone, chin, or jawline)."
        },
        {
          "p": "When out of balance, Vata-Kapha skin can feel both under-nourished and sluggishly dull, reacting poorly to heavy winter weather, cold winds, and erratic daily routines."
        },
        {
          "p": "**The Anti-Confusion Shift:** Standard skincare treats combination skin by using drying astringents on the T-zone and heavy creams everywhere else—leaving the skin barrier confused and overwhelmed. Ayurvedic wisdom takes a targeted approach: **we use warming, circulation-boosting botanicals to clear Kapha congestion while offering gentle, nourishing hydration to Vata zones.**"
        },
        {
          "p": "Over the next few weeks, we’ll guide you through warming spices, targeted dual-zone rituals, and breathwork made specifically to restore your skin's equilibrium."
        }
      ]
    },
    {
      "step": 2,
      "subject": "Warm & stimulate from within: A balancing recipe for Vata-Kapha skin",
      "preview": "Swap cold, heavy foods for light, spiced, and warming meals that awaken sluggish tissue.",
      "blocks": [
        {
          "p": "Vata-Kapha skin is heavily impacted by cold and damp conditions. Heavy dairy, iced drinks, cold raw salads, and excessive sweets aggravate Kapha stagnation while simultaneously stirring up Vata dryness."
        },
        {
          "p": "Your complexion thrives on **light, warm, and pungent foods** spiced generously to ignite your digestion and stimulate micro-circulation."
        },
        {
          "p": "**Try This Week: Spiced Red Lentil Dal with Ginger & Ghee**"
        },
        {
          "ul": [
            "**Why it works:** Red lentils (masoor dal) are nourishing yet light, providing grounding plant protein without the heaviness of dairy or heavy grains. Tempered with warming ghee, fresh ginger, cumin, and black pepper, it stimulates lymphatic flow while deeply nourishing dry tissue layers."
          ]
        },
        {
          "ul": [
            "**The Ritual:** Enjoy this warm and spiced soup for lunch or an early dinner, avoiding cold leftovers or chilled beverages."
          ]
        },
        {
          "p": "Skip dairy, cold snacks, and iced drinks this week, and notice how much clearer and more energized your skin feels."
        }
      ]
    },
    {
      "step": 3,
      "subject": "The ultimate Vata-Kapha ritual: Targeted Udwartana & Warm Oil Care",
      "preview": "How to stimulate sluggish areas while protecting delicate dry zones.",
      "blocks": [
        {
          "p": "Caring for Vata-Kapha skin requires a balanced hand: your T-zone craves stimulation and gentle exfoliation, while your drier areas need comforting warmth and moisture."
        },
        {
          "p": "**How to Practice the Dual-Action Vata-Kapha Ritual:**"
        },
        {
          "ol": [
            "**Stimulate the Congested Zones:** Once a week, use a gentle herbal dry powder (like chickpea flour with a pinch of dry ginger) on your T-zone or areas prone to sluggishness to encourage lymphatic drainage.",
            "**Nourish the Dry Zones:** Warm a few drops of light sesame or almond oil and press gently into dry cheeks and neck areas.",
            "**Lukewarm Rinses:** Always cleanse with lukewarm water—never freezing cold or scalding hot—to protect capillaries and balance both elements simultaneously."
          ]
        }
      ]
    },
    {
      "step": 4,
      "subject": "Awakening movement & breathwork for Vata-Kapha skin",
      "preview": "Melt morning heaviness and ground scattered energy with dynamic flow.",
      "blocks": [
        {
          "p": "Vata-Kapha types can struggle with morning inertia and irregular energy levels. Staying sedentary allows Kapha fluids to stagnate, while scattered Vata energy makes consistency difficult."
        },
        {
          "p": "Your skin glows brightest when movement combines **invigorating heat with steady grounding**."
        },
        {
          "p": "**Your Skin-Awakening Practice:**"
        },
        {
          "ul": [
            "**Dynamic Sun Salutations (Surya Namaskar):** A steady, moderately paced flow builds internal body heat, opens blocked channels, and flushes toxins through your pores."
          ]
        },
        {
          "ul": [
            "**Kapalabhati & Anulom Vilom Combo:** Spend 2 minutes on Kapalabhati breath to clear sluggish Kapha heaviness, followed by 3 minutes of Alternate Nostril Breathing to calm Vata anxiety."
          ]
        }
      ]
    },
    {
      "step": 5,
      "subject": "Bringing it all together: Your balanced Vata-Kapha sanctuary",
      "preview": "Trade heaviness for vibrant consistency—the secret to lasting Vata-Kapha radiance.",
      "blocks": [
        {
          "p": "Over the past three weeks, we’ve explored how your Vata-Kapha skin thrives when cold dryness and heavy sluggishness are met with warming spices, targeted care, and dynamic breathwork."
        },
        {
          "p": "The ultimate key to maintaining your results is **rhythm**. By waking up with the sun, eating warm freshly cooked meals, and keeping your movement consistent, you prevent both elements from swinging out of balance."
        },
        {
          "p": "**Your Anchor for Lasting Radiance:**"
        },
        {
          "ul": [
            "Keep your mornings active and warm, avoiding heavy morning meals or prolonged lounging."
          ]
        },
        {
          "ul": [
            "Step onto your meditation mat for a few rounds of breathwork before your day begins, anchoring your mind in clarity and warmth."
          ]
        },
        {
          "p": "Thank you for walking this conscious path with us. Whenever you’re ready to explore Vairutya’s artisanal rituals and essentials, our studio doors are always open."
        }
      ]
    }
  ],
  "pitta-kapha": [
    {
      "step": 1,
      "subject": "Deep dive: Balancing heat & congestion (Your Pitta-Kapha Skin explained)",
      "preview": "Why your skin experiences both deep cystic breakouts and heavy oiliness—and how to cool both.",
      "blocks": [
        {
          "p": "Your skin profile quiz on Vairutya revealed that your skin is **Pitta-Kapha (Fire + Water/Earth)**. This dual combination pairs Pitta’s fiery tendency toward inflammation, redness, and reactive breakouts with Kapha’s heavy, dense, and oily qualities."
        },
        {
          "p": "When out of balance, Pitta-Kapha skin can trap heat beneath a thick, oily layer of sebum—leading to stubborn congestion, cystic spots, and persistent irritation that is slow to heal."
        },
        {
          "p": "**The Anti-Confusion Shift:** Standard skincare treats oily, acne-prone skin with harsh, alcohol-based drying agents and harsh acids that strip the surface while triggering more inflammation and heat. Ayurvedic wisdom approaches this with precision: **we use cooling, astringent botanicals that draw out deep-seated impurities and reduce oiliness without provoking Pitta redness.**"
        },
        {
          "p": "Over the next few weeks, we’ll guide you through cooling, purifying recipes, gentle herbal cleansing rituals, and breathwork made specifically to restore your skin's clear, balanced glow."
        }
      ]
    },
    {
      "step": 2,
      "subject": "Cool & clarify from within: A purifying recipe for Pitta-Kapha skin",
      "preview": "Swap heavy oils, dairy, and spicy foods for bitter greens and cooling hydration.",
      "blocks": [
        {
          "p": "Pitta-Kapha skin is heavily aggravated by heavy dairy, fried foods, excessive oils, and sharp, fiery spices. These foods create sticky metabolic waste (ama) that mixes with excess heat, manifesting directly as skin congestion and breakouts."
        },
        {
          "p": "Your complexion thrives on **bitter, astringent, and naturally cooling foods** that purify the blood and lighten sluggish tissue."
        },
        {
          "p": "**Try This Week: Bitter Melon & Moong Dal Detox Soup**"
        },
        {
          "ul": [
            "**Why it works:** Bitter greens and bitter melon (karela) are premier blood purifiers in Ayurveda, pulling heat and toxins out of the liver while regulating sebum production. Split yellow mung dal provides light, oil-free protein that is easy on digestion."
          ]
        },
        {
          "ul": [
            "**The Ritual:** Simmer yellow mung dal with fresh turmeric, coriander powder, and finely sliced bitter greens. Enjoy warm to cleanse the lymphatic channels and cool internal inflammation."
          ]
        },
        {
          "p": "Skip heavy cheeses, oily snacks, and chilies this week, and watch your skin's clarity and texture visibly improve."
        }
      ]
    },
    {
      "step": 3,
      "subject": "The ultimate Pitta-Kapha ritual: Cooling Herbal Udwartana",
      "preview": "How to gently exfoliate and clear congestion without triggering skin redness or heat.",
      "blocks": [
        {
          "p": "Because Pitta-Kapha skin battles both oil congestion and inflammatory sensitivity, your cleansing ritual must be both clarifying and non-irritating. Heavy oils will clog pores, while harsh scrubs will anger Pitta capillaries."
        },
        {
          "p": "**How to Practice the Cooling Purification Ritual:**"
        },
        {
          "ol": [
            "**The Cooling Herbal Blend:** Mix chickpea flour (besan) or neem leaf powder with a pinch of cooling sandalwood powder and rose petal powder.",
            "**Gentle Upward Sweep:** Mix into a smooth paste with rosewater and apply to oily, congested zones, massaging very gently in upward strokes to stimulate lymphatic drainage without friction-induced heat.",
            "**Cool Water Rinse:** Always rinse thoroughly with cool water to soothe inflamed capillaries and instantly close pores."
          ]
        }
      ]
    },
    {
      "step": 4,
      "subject": "Calming, non-overheating movement for Pitta-Kapha skin",
      "preview": "Swap intense, high-sweat workouts for cooling flows and Sheetali breath.",
      "blocks": [
        {
          "p": "While Kapha types need movement to combat sluggishness, Pitta heat means you must avoid overheating your body during exercise, as heavy sweat trapped under oily pores triggers breakouts."
        },
        {
          "p": "Your skin glows brightest when movement is **dynamic yet cooling**."
        },
        {
          "p": "**Your Skin-Balancing Practice:**"
        },
        {
          "ul": [
            "**Moon Salutations & Moderate Flow:** Focus on steady, unhurried movements that build healthy circulation without spiking body temperature or facial flushing."
          ]
        },
        {
          "ul": [
            "**Sheetali Pranayama (Cooling Breath):** Spend 5 minutes on your meditation mat practicing cooling breaths. Inhaling through a curled tongue cools internal fire immediately, preventing heat-driven skin flare-ups."
          ]
        }
      ]
    },
    {
      "step": 5,
      "subject": "Bringing it all together: Your clear Pitta-Kapha sanctuary",
      "preview": "Trade inflammation for lasting clarity—the secret to balanced Pitta-Kapha radiance.",
      "blocks": [
        {
          "p": "Over the past three weeks, we’ve explored how your Pitta-Kapha skin thrives when inflammatory heat and heavy oiliness are met with purifying bitter foods, cooling herbal care, and mindful breathwork."
        },
        {
          "p": "The ultimate key to maintaining your results is **consistency in moderation**. By keeping your diet clean, avoiding excess fried foods, and protecting your skin from overheating, you maintain a calm, crystal-clear complexion."
        },
        {
          "p": "**Your Anchor for Lasting Clarity:**"
        },
        {
          "ul": [
            "Keep pure rosewater on hand to mist away midday heat and oiliness."
          ]
        },
        {
          "ul": [
            "Step onto your meditation mat for five quiet minutes of cooling breathwork before bed, letting your mind and skin reset in peaceful calm."
          ]
        },
        {
          "p": "Thank you for walking this conscious path with us. Whenever you’re ready to explore Vairutya’s botanical care essentials, our studio doors are always open."
        }
      ]
    }
  ],
  "tridoshic": [
    {
      "step": 1,
      "subject": "Deep dive: The rare gift of Tridoshik balance (Your skin explained)",
      "preview": "Why your skin naturally adapts across seasons—and how to protect your equilibrium.",
      "blocks": [
        {
          "p": "Your skin profile quiz on Vairutya revealed that your skin is **Tridoshik**—a harmonious blend where Vata, Pitta, and Kapha exist in a natural, stable equilibrium."
        },
        {
          "p": "When your skin is Tridoshik, you are blessed with resilience, natural elasticity, and an even tone. However, because skin is constantly interacting with shifting weather, stress, travel, and lifestyle changes, even a balanced constitution can occasionally sway toward excess dryness, heat, or congestion during seasonal transitions."
        },
        {
          "p": "**The Anti-Confusion Shift:** Many people with balanced skin make the mistake of using random products or skipping routines entirely until an imbalance hits. Ayurvedic wisdom teaches proactive maintenance: **we honor your natural baseline with clean, nourishing, and adaptive care that preserves your skin's intrinsic glow.**"
        },
        {
          "p": "Over the next few weeks, we’ll guide you through seasonal recipes, balancing daily rituals, and breathwork made specifically to maintain your Tridoshik harmony all year round."
        }
      ]
    },
    {
      "step": 2,
      "subject": "Eat for the season: Maintaining your Tridoshik glow from within",
      "preview": "How adaptive eating keeps Vata, Pitta, and Kapha perfectly aligned in your kitchen.",
      "blocks": [
        {
          "p": "For Tridoshik skin, your greatest superpower is adaptability. Because your doshas are naturally balanced, your diet can be balanced too—rotating through all six Ayurvedic tastes (sweet, sour, salty, pungent, bitter, and astringent) depending on the season."
        },
        {
          "p": "**The Tridoshik Seasonal Rule of Thumb:**"
        },
        {
          "ul": [
            "**In Winter/Dry Weather:** Favor warm, nourishing, slightly unctuous foods (soups, root vegetables, pure ghee) to keep Vata dryness at bay."
          ]
        },
        {
          "ul": [
            "**In Summer/Hot Weather:** Favor cooling hydration (fresh fruits, cucumber, coconut water, mint) to keep Pitta heat pacified."
          ]
        },
        {
          "ul": [
            "**In Spring/Damp Weather:** Favor lighter, spiced, and pungent meals to prevent sluggish Kapha accumulation."
          ]
        },
        {
          "p": "By listening to the season and matching your plate to the weather outside, your skin stays effortlessly clear and glowing without needing aggressive corrections."
        }
      ]
    },
    {
      "step": 3,
      "subject": "The ultimate Tridoshik ritual: Balanced Abhyanga & Mindful Nourishment",
      "preview": "How to maintain your skin barrier with adaptive, golden self-care rituals.",
      "blocks": [
        {
          "p": "Because your skin is naturally balanced, your daily care routine should focus on preserving your lipid barrier and nurturing your nervous system."
        },
        {
          "p": "**How to Practice the Tridoshik Maintenance Ritual:**"
        },
        {
          "ol": [
            "**Adaptive Oil Selection:** Use light, balancing oils like **sesame oil** in cooler months, **coconut or sunflower oil** in peak summer, and **almond oil** during transitional seasons.",
            "**Mindful Touch:** Massage your skin using moderate, circular strokes over joints and long strokes over limbs to stimulate healthy lymphatic flow without overwhelming your system.",
            "**Hydration Seal:** Finish with a light mist of pure rosewater to refresh your complexion and keep your natural glow alive."
          ]
        }
      ]
    },
    {
      "step": 4,
      "subject": "Harmonious movement & breathwork for Tridoshik vitality",
      "preview": "Complete-spectrum yoga and balanced breathing to keep your energy centered.",
      "blocks": [
        {
          "p": "Tridoshik bodies thrive on variety and balance. Your movement practice should incorporate strength, flexibility, calmness, and breath—never pushing your body into exhaustion or letting it slip into complete stillness."
        },
        {
          "p": "**Your Balanced Practice:**"
        },
        {
          "ul": [
            "**Full-Spectrum Asana Flow:** A balanced mix of grounding floor poses (for Vata), heart-opening flows (for Pitta), and dynamic movement (for Kapha)."
          ]
        },
        {
          "ul": [
            "**Balanced Pranayama:** Spend 5 minutes on your meditation mat alternating between calming breaths (Nadi Shodhana) and steady, grounding awareness. Let your breath mirror your inner equilibrium."
          ]
        }
      ]
    },
    {
      "step": 5,
      "subject": "Bringing it all together: Your lifelong Tridoshik sanctuary",
      "preview": "Honoring your natural rhythm—the true secret to effortless, lifelong radiance.",
      "blocks": [
        {
          "p": "Over the past three weeks, we’ve explored how your Tridoshik skin thrives on adaptive, seasonal care— adjusting your food, oils, and movement as nature shifts around you."
        },
        {
          "p": "The beauty of a balanced constitution is that when you stay attuned to your inner and outer environment, radiance becomes your natural state."
        },
        {
          "p": "**Your Anchor for Lasting Equilibrium:**"
        },
        {
          "ul": [
            "Pay attention to seasonal shifts; adapt your skincare oils and meals before an imbalance has a chance to appear."
          ]
        },
        {
          "ul": [
            "Step onto your meditation mat daily for quiet reflection, honoring the peace and balance you carry within."
          ]
        },
        {
          "p": "Thank you for walking this conscious path with us. Whenever you’re ready to explore Vairutya’s artisanal rituals and essentials, our studio doors are always open."
        }
      ]
    }
  ]
};
