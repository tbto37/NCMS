package kr.co.tobetheone.ncms.global.domain;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;
import java.sql.ResultSet;
import java.sql.Statement;

public class StringSequenceGenerator implements IdentifierGenerator {

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        String className = object.getClass().getSimpleName();
        String seqName = "orders_id_seq";

        if ("Member".equals(className)) {
            seqName = "members_id_seq";
        } else if ("OrderSnapshot".equals(className)) {
            seqName = "order_snapshots_id_seq";
        }

        final String targetSeq = seqName;

        return session.doReturningWork(connection -> {
            try (Statement statement = connection.createStatement();
                 ResultSet rs = statement.executeQuery("SELECT nextval('" + targetSeq + "')::text")) {
                if (rs.next()) {
                    return rs.getString(1);
                }
            } catch (Exception e) {
                return String.valueOf(System.currentTimeMillis());
            }
            return String.valueOf(System.currentTimeMillis());
        });
    }
}
