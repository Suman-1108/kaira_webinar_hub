const storage = require('../services/storage');

exports.getWebinars = async (req, res) => {
  try {
    const { category, search, priceType, sort = 'upcoming' } = req.query;
    let list = await storage.getWebinars();

    // Filter by published status for public queries unless explicitly all
    if (req.query.status) {
      list = list.filter(w => w.status === req.query.status);
    }

    if (category && category !== 'All' && category !== 'all') {
      const catLower = category.toLowerCase();
      list = list.filter(w =>
        (w.category && w.category.toLowerCase() === catLower) ||
        (w.categoryId && w.categoryId.toLowerCase() === catLower)
      );
    }

    if (priceType) {
      if (priceType === 'free') list = list.filter(w => w.price === 0);
      else if (priceType === 'paid') list = list.filter(w => w.price > 0);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(w =>
        (w.title && w.title.toLowerCase().includes(q)) ||
        (w.speaker && w.speaker.name && w.speaker.name.toLowerCase().includes(q)) ||
        (w.category && w.category.toLowerCase().includes(q)) ||
        (w.tagline && w.tagline.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort === 'price_low') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'price_high') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === 'rating') {
      list.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    } else if (sort === 'newest') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error('getWebinars error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving webinars' });
  }
};

exports.getWebinarByIdOrSlug = async (req, res) => {
  try {
    const identifier = req.params.identifier || req.params.id;
    const webinar = await storage.getWebinarById(identifier);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Webinar not found' });
    }
    res.json({ success: true, data: webinar });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const webinars = await storage.getWebinars();
    const map = {};
    webinars.forEach(w => {
      const cat = w.category || 'General';
      if (!map[cat]) {
        map[cat] = {
          name: cat,
          slug: w.categoryId || cat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          count: 0,
          poster: w.posterImage || w.thumbnail
        };
      }
      map[cat].count += 1;
    });

    const categories = Object.values(map);
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve categories' });
  }
};

exports.getSpeakers = async (req, res) => {
  try {
    const webinars = await storage.getWebinars();
    const speakerMap = {};

    webinars.forEach(w => {
      if (w.speaker && w.speaker.name) {
        const name = w.speaker.name;
        if (!speakerMap[name]) {
          speakerMap[name] = {
            ...w.speaker,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            eventsCount: 0,
            webinars: []
          };
        }
        speakerMap[name].eventsCount += 1;
        speakerMap[name].webinars.push({
          id: w.id,
          slug: w.slug,
          title: w.title,
          date: w.date,
          price: w.price
        });
      }
    });

    res.json({ success: true, count: Object.keys(speakerMap).length, data: Object.values(speakerMap) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve speakers' });
  }
};

exports.createWebinar = async (req, res) => {
  try {
    const created = await storage.createWebinar(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateWebinar = async (req, res) => {
  try {
    const updated = await storage.updateWebinar(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Webinar not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteWebinar = async (req, res) => {
  try {
    await storage.deleteWebinar(req.params.id);
    res.json({ success: true, message: 'Webinar deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting webinar' });
  }
};
