import {integer,sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const artistApplications=sqliteTable('artist_applications',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),name:text('name').notNull(),email:text('email').notNull(),portfolio:text('portfolio').notNull(),medium:text('medium').notNull(),statement:text('statement').notNull(),status:text('status').notNull().default('pending'),createdAt:integer('created_at').notNull(),reviewedAt:integer('reviewed_at')
});
