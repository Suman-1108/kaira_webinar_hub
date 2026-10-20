const storage = require('../services/storage');

exports.getWebinars = async (req, res) => {
  try {
    const { category, search } = req.query;
    let list = await storage.getWebinars();
    
    if (category && category !== 'All') {
      list = list.filter(w => w.category === category);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(w => 
        w.title.toLowerCase().includes(q) || 
        w.speaker.name.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error('getWebinars error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving webinars' });
  }
};

exports.getWebinarById = async (req, res) => {
  try {
    const webinar = await storage.getWebinarById(req.params.id);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Webinar not found' });
    }
    res.json({ success: true, data: webinar });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
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
