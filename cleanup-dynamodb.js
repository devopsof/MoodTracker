// Script to delete all entries from DynamoDB MoodEntries table
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'MoodEntries';

async function deleteAllEntries() {
  try {
    console.log('🔄 Scanning table for all entries...');
    
    // First, scan the table to get all items
    const scanCommand = new ScanCommand({
      TableName: TABLE_NAME
    });
    
    const result = await dynamoDb.send(scanCommand);
    const items = result.Items || [];
    
    console.log(`📊 Found ${items.length} entries to delete`);
    
    if (items.length === 0) {
      console.log('✅ Table is already empty!');
      return;
    }
    
    // Delete each item
    let deletedCount = 0;
    for (const item of items) {
      try {
        const deleteCommand = new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            userId: item.userId,
            entryId: item.entryId
          }
        });
        
        await dynamoDb.send(deleteCommand);
        deletedCount++;
        
        console.log(`🗑️  Deleted entry ${deletedCount}/${items.length}: ${item.userId} - ${item.note || 'No note'}`);
      } catch (deleteError) {
        console.error(`❌ Failed to delete entry ${item.entryId}:`, deleteError);
      }
    }
    
    console.log(`✅ Successfully deleted ${deletedCount} entries`);
    console.log('🎉 All entries have been cleared from the database!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    
    if (error.name === 'ResourceNotFoundException') {
      console.log('❓ Table MoodEntries not found. Make sure the table exists.');
    }
  }
}

// Run the cleanup
deleteAllEntries();
