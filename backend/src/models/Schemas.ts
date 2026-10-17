import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  status: { type: String, enum: ['valid', 'invalid', 'pending'], default: 'pending' },
  useProxy: { type: Boolean, default: false },
  proxy: { type: String, default: null },
  lastUsed: { type: Date },
});

const LeadSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: String,
  status: { type: String, enum: ['pending', 'sent', 'blocked'], default: 'pending' },
  serverOrigin: String,
}, { timestamps: true });

const TemplateSchema = new mongoose.Schema({
  name: String,
  content: String,
  imageUrl: String,
});

export const Token = mongoose.model('Token', TokenSchema);
export const Lead = mongoose.model('Lead', LeadSchema);
export const Template = mongoose.model('Template', TemplateSchema);
