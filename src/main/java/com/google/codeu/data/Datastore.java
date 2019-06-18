/*
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.google.codeu.data;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Provides access to the data stored in Datastore. */
public class Datastore {

  private DatastoreService datastore;

  public Datastore() {
    datastore = DatastoreServiceFactory.getDatastoreService();
  }

  /** Stores the Message in Datastore. */
  public void storeMessage(Message message) {
    Entity messageEntity = new Entity("Message", message.getId().toString());
    messageEntity.setProperty("user", message.getUser());
    messageEntity.setProperty("text", message.getText());
    messageEntity.setProperty("timestamp", message.getTimestamp());
    messageEntity.setProperty("sentimentScore", message.getSentimentScore());

    datastore.put(messageEntity);

    System.out.println("successfully stored message");
    System.out.println(message.getSentimentScore());

  }

  /**
   * Gets messages posted by a specific user.
   *
   * @return a list of messages posted by the user, or empty list if user has never posted a
   *     message. List is sorted by time descending.
   */
  public List<Message> getMessages(String user) {
    List<Message> messages;
    Query query =
        new Query("Message")
            .setFilter(new Query.FilterPredicate("user", FilterOperator.EQUAL, user))
            .addSort("timestamp", SortDirection.DESCENDING);
    messages = getMessagesHelperFunction(query);
    return messages;
  }

  /**
   * Gets all messages.
   *
   * @return a list of all messages posted, or empty list if no messages have
   *     been posted. List is sorted by time descending.
   */
  public List<Message> getAllMessages(){
    List<Message> messages;
    Query query =
      new Query("Message")
        .addSort("timestamp", SortDirection.DESCENDING);

    messages = getMessagesHelperFunction(query);
    return messages;
  }

  private List<Message> getMessagesHelperFunction(Query query){
    List<Message> messages = new ArrayList<>();

    PreparedQuery results = datastore.prepare(query);

    for (Entity entity : results.asIterable()) {
      try {
        String idString = entity.getKey().getName();
        System.out.println("successfully read the message entity ID");
        UUID id = UUID.fromString(idString);
        String user = (String) entity.getProperty("user");
        System.out.println("successfully read the message entity USER");
        String text = (String) entity.getProperty("text");
        System.out.println("successfully read the message entity TEXT");
        long timestamp = (long) entity.getProperty("timestamp");
        System.out.println("successfully read the message entity TIMESTAMP");
        Float sentimentScore = (Float) entity.getProperty("sentimentScore");
        System.out.println("successfully read the message entity SCORE");

        Message message = new Message(id, user, text, timestamp, sentimentScore);
        messages.add(message);
        System.out.println("successfully retrieved message");
        System.out.println(sentimentScore);
      } catch (Exception e) {
        System.err.println("Error reading message.");
        System.err.println(entity.toString());
        e.printStackTrace();
      }
    }

    return messages;
  }

  /**
   * Gets all users
   * @return a list of user strings or empty string if there is no user
   */
  public Set<String> getUsers(){
    Set<String> users = new HashSet<>();
    Query query = new Query("Message");
    PreparedQuery results = datastore.prepare(query);
    for(Entity entity : results.asIterable()) {
      users.add((String) entity.getProperty("user"));
    }
    return users;
  }
  /**
   * Gets number of total messages
   *
   * @return the total number of messages for all users.
   */
  public int getTotalMessageCount(){
    Query query = new Query("Message");
    PreparedQuery results = datastore.prepare(query);
    return results.countEntities(FetchOptions.Builder.withLimit(1000));
  }

  /**
   * Gets the longest message length
   *
   * @return the longest message length
   */
  public int getLongestMessageLength() {
    Query query = new Query("Message");
    PreparedQuery results = datastore.prepare(query);
    int maxLength = 0;
    for (Entity entity : results.asIterable()) {
      String msgText = (String) entity.getProperty("text");
      int msgLength = msgText.length();
      if (msgLength > maxLength) {
        maxLength = msgLength;
      }
    }
    return maxLength;
  }


}
